'use client';

import {
    PostComment,
    withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';

export default withProvider({
    postComment: PostComment.NO_COMMENT,
    minimumCharacters: [],
    SettingsComponent: null,
    CustomPreviewComponent: undefined,
    dto: undefined,
    checkValidity: async () => {
        return true;
    },
    maximumCharacters: 2000,
});

