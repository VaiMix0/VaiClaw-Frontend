import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Điều khoản Dịch vụ (Terms of Service) | VaiMix',
    description: 'Điều khoản dịch vụ của nền tảng VaiMix.',
};

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto py-24 px-6 md:px-12 text-zinc-300">
            <h1 className="text-4xl font-bold mb-8 text-white">Điều khoản Dịch vụ (Terms of Service)</h1>

            <div className="space-y-6">
                <p><strong>Ngày cập nhật:</strong> 01/01/2026</p>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">1. Chấp nhận các Điều khoản</h2>
                    <p>Bằng việc đăng ký tài khoản và sử dụng VaiMix (do ATV MKT Online phát triển và quản lý), bạn xác nhận đã đọc, hiểu và đồng ý với tất cả các Điều khoản Dịch vụ này. Nếu bạn không đồng ý, vui lòng ngừng sử dụng nền tảng.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">2. Quyền và Trách nhiệm của Người dùng</h2>
                    <ul className="list-disc ml-6 space-y-2">
                        <li>Bạn tự chịu trách nhiệm về tính hợp pháp của mọi nội dung được đăng tải thông qua hệ thống VaiMix lên các nền tảng mạng xã hội (TikTok, Facebook, LinkedIn, v.v.).</li>
                        <li>VaiMix là nền tảng quản lý tập trung và lên lịch. VaiMix không chịu trách nhiệm nếu nội dung của bạn vi phạm tiêu chuẩn cộng đồng của nền tảng đích.</li>
                        <li>Người dùng có trách nhiệm bảo vệ tài khoản VaiMix của mình và không chia sẻ mật khẩu cho người trái thẩm quyền.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">3. Tích hợp bên thứ 3 (TikTok, Meta, X...)</h2>
                    <p>Khi liên kết các kênh mạng xã hội vào VaiMix, bạn cấp quyền hợp lệ để VaiMix thay mặt bạn thao tác API lên nền tảng đó. Mọi phân phối dữ liệu tuân thủ chính sách của nền tảng (Ví dụ: TikTok API Terms). Bạn có thể ngừng liên kết (Revoke) bất kỳ lúc nào.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">4. Sử dụng phần mềm hợp pháp (Fair Use)</h2>
                    <p>Người dùng không được phép sử dụng VaiMix nhằm mục đích tấn công mạng, phá hoại dự án, Spam, hoặc lan truyền mã độc. Nếu phát hiện hành vi cố tình lạm dụng hệ thống, VaiMix có toàn quyền đóng băng tài khoản mà không cần báo trước.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">5. Thay đổi tính năng và dịch vụ</h2>
                    <p>Chúng tôi không ngừng nâng cấp và cập nhật hệ thống. Do đó, các tính năng có thể thay đổi hoặc bị giới hạn theo định hướng phát triển ở từng thời điểm. Chúng tôi sẽ thông báo đến bạn trước những thay đổi lớn.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">6. Giới hạn Trách nhiệm</h2>
                    <p>VaiMix được cung cấp dưới dạng bản ghi &quot;nguyên trạng&quot;. Chúng tôi sẽ cố gắng cung cấp dịch vụ ổn định nhất (Uptime 99.9%), tuy nhiên không có phần mềm nào an toàn hay không gặp sự cố tuyệt đối. Chúng tôi từ chối bảo đảm những thiệt hại đặc biệt gián tiếp do mất mát dữ liệu không lường trước.</p>
                </section>
            </div>
        </div>
    );
}
