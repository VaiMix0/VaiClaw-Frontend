import {
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import dayjs from 'dayjs';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
//@ts-ignore
import mime from 'mime';
import TelegramBot from 'node-telegram-bot-api';
import { Integration } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import striptags from 'striptags';

// Added to support local storage posting
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
const mediaStorage = process.env.STORAGE_PROVIDER || 'local';

export class TelegramProvider extends SocialAbstract implements SocialProvider {
  override maxConcurrentJob = 3; // Telegram has moderate bot API limits
  identifier = 'telegram';
  name = 'Telegram';
  isBetweenSteps = false;
  isWeb3 = false;
  scopes = [] as string[];
  editor = 'html' as const;
  maxLength() {
    return 4096;
  }

  async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
    return {
      refreshToken: '',
      expiresIn: 0,
      accessToken: '',
      id: '',
      name: '',
      picture: '',
      username: '',
    };
  }

  async generateAuthUrl() {
    const state = makeId(17);
    return {
      url: state,
      codeVerifier: makeId(10),
      state,
    };
  }

  async customFields() {
    return [
      {
        key: 'botToken',
        label: 'Bot Token (from @BotFather)',
        validation: `/^\\d+:[A-Za-z0-9_-]{35,}$/`,
        type: 'password' as const,
      },
      {
        key: 'chatId',
        label: 'Channel / Group ID hoặc @username',
        validation: `/^.{3,}$/`,
        type: 'text' as const,
      },
    ];
  }

  async authenticate(params: {
    code: string;
    codeVerifier: string;
    refresh?: string;
  }) {
    try {
      const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
      const { botToken, chatId } = body;

      if (!botToken || !chatId) {
        return 'Bot Token và Chat ID là bắt buộc';
      }

      const bot = new TelegramBot(botToken);

      // Verify bot token is valid
      const me = await bot.getMe();
      if (!me?.id) {
        return 'Bot Token không hợp lệ';
      }

      // Verify chat exists and bot has access
      let chat: any;
      try {
        chat = await bot.getChat(chatId);
      } catch (e) {
        return 'Không tìm thấy kênh/nhóm. Bot cần được thêm vào kênh/nhóm trước.';
      }

      if (!chat?.id) {
        return 'Không tìm thấy kênh/nhóm';
      }

      const photo =
        !chat?.photo?.big_file_id
          ? ''
          : await bot.getFileLink(chat.photo.big_file_id).catch(() => '');

      // Store botToken as accessToken so we can use it when posting
      const accessToken = JSON.stringify({ botToken, numericChatId: String(chat.id) });

      return {
        id: String(chat.username ? chat.username : chat.id),
        name: chat.title || me.first_name,
        accessToken,
        refreshToken: '',
        expiresIn: dayjs().add(200, 'year').unix() - dayjs().unix(),
        picture: photo || '',
        username: chat.username || '',
      };
    } catch (e) {
      console.error('Telegram authenticate error:', e);
      return 'Xác thực thất bại. Vui lòng kiểm tra lại Bot Token và Chat ID.';
    }
  }

  private parseAccessToken(accessToken: string): { botToken: string; numericChatId: string } {
    return JSON.parse(accessToken);
  }

  private processMedia(mediaFiles: PostDetails['media']) {
    return (mediaFiles || []).map((media) => {
      let mediaUrl = media.path;
      if (mediaStorage === 'local' && mediaUrl.startsWith(frontendURL)) {
        mediaUrl = mediaUrl.replace(frontendURL, '');
      }
      //get mime type to pass contentType to telegram api.
      //some photos and videos might not pass telegram api restrictions, so they are sent as documents instead of returning errors
      const mimeType = mime.getType(mediaUrl); // Detect MIME type
      let mediaType: 'photo' | 'video' | 'document';

      if (mimeType?.startsWith('image/')) {
        mediaType = 'photo';
      } else if (mimeType?.startsWith('video/')) {
        mediaType = 'video';
      } else {
        mediaType = 'document';
      }

      return {
        type: mediaType,
        media: mediaUrl,
        fileOptions: {
          filename: media.path.split('/').pop(),
          contentType: mimeType || 'application/octet-stream',
        },
      };
    });
  }

  private async sendMessage(
    bot: TelegramBot,
    chatId: string,
    message: PostDetails,
    replyToMessageId?: number
  ): Promise<number | null> {
    let messageId: number | null = null;
    const mediaFiles = message.media || [];
    const text = striptags(message.message || '', ['u', 'strong', 'p'])
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<p>(.*?)<\/p>/g, '$1\n');

    const processedMedia = this.processMedia(mediaFiles);

    // if there's no media, bot sends a text message only
    if (processedMedia.length === 0) {
      const response = await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
      });
      messageId = response.message_id;
    }
    // if there's only one media, bot sends the media with the text message as caption
    else if (processedMedia.length === 1) {
      const media = processedMedia[0];
      const options = {
        caption: text,
        parse_mode: 'HTML' as const,
        ...(replyToMessageId ? { reply_to_message_id: replyToMessageId } : {}),
      };
      const response =
        media.type === 'video'
          ? await bot.sendVideo(
            chatId,
            media.media,
            options,
            media.fileOptions
          )
          : media.type === 'photo'
            ? await bot.sendPhoto(
              chatId,
              media.media,
              options,
              media.fileOptions
            )
            : await bot.sendDocument(
              chatId,
              media.media,
              options,
              media.fileOptions
            );
      messageId = response.message_id;
    }
    // if there are multiple media, bot sends them as a media group - max 10 media per group - with the text as a caption (if there are more than 1 group, the caption will only be sent with the first group)
    else {
      const mediaGroups = this.chunkMedia(processedMedia, 10);
      for (let i = 0; i < mediaGroups.length; i++) {
        const mediaGroup = mediaGroups[i].map((m, index) => ({
          type: m.type === 'document' ? 'document' : m.type, // Documents are not allowed in media groups
          media: m.media,
          caption: i === 0 && index === 0 ? text : undefined,
          parse_mode: 'HTML',
        }));

        const response = await bot.sendMediaGroup(
          chatId,
          mediaGroup as any[],
          {
            ...(replyToMessageId && i === 0
              ? { reply_to_message_id: replyToMessageId }
              : {}),
          }
        );
        if (i === 0) {
          messageId = response[0].message_id;
        }
      }
    }

    return messageId;
  }

  async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]> {
    const { botToken, numericChatId } = this.parseAccessToken(accessToken);
    const bot = new TelegramBot(botToken);
    const [firstPost] = postDetails;

    const messageId = await this.sendMessage(bot, numericChatId, firstPost);

    // for private groups/channels message.id is undefined so the link generated by Postiz will be unusable "https://t.me/c/undefined/16"
    // to avoid that, we use numericChatId instead of message.id and we generate the link manually removing the -100 from the start.
    if (messageId) {
      return [
        {
          id: firstPost.id,
          postId: String(messageId),
          releaseURL: `https://t.me/${id !== 'undefined' ? id : `c/${numericChatId.replace('-100', '')}`
            }/${messageId}`,
          status: 'completed',
        },
      ];
    }

    return [];
  }

  async comment(
    id: string,
    postId: string,
    lastCommentId: string | undefined,
    accessToken: string,
    postDetails: PostDetails[],
    integration: Integration
  ): Promise<PostResponse[]> {
    const { botToken, numericChatId } = this.parseAccessToken(accessToken);
    const bot = new TelegramBot(botToken);
    const [commentPost] = postDetails;
    const replyToId = Number(lastCommentId || postId);

    const messageId = await this.sendMessage(bot, numericChatId, commentPost, replyToId);

    if (messageId) {
      return [
        {
          id: commentPost.id,
          postId: String(messageId),
          releaseURL: `https://t.me/${id !== 'undefined' ? id : `c/${numericChatId.replace('-100', '')}`
            }/${messageId}`,
          status: 'completed',
        },
      ];
    }

    return [];
  }
  // chunkMedia is used to split media into groups of "size". 10 is used here because telegram api allows a maximum of 10 media per group
  private chunkMedia(media: { type: string; media: string }[], size: number) {
    const result = [];
    for (let i = 0; i < media.length; i += size) {
      result.push(media.slice(i, i + size));
    }
    return result;
  }
}
