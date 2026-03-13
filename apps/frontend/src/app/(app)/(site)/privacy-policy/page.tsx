import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chính sách bảo mật (Privacy Policy) | VaiMix',
    description: 'Chính sách bảo mật của nền tảng VaiMix.',
};

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto py-24 px-6 md:px-12 text-zinc-300">
            <h1 className="text-4xl font-bold mb-8 text-white">Chính sách Bảo mật (Privacy Policy)</h1>

            <div className="space-y-6">
                <p><strong>Ngày hiệu lực:</strong> 01/01/2026</p>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">1. Mục đích thu thập thông tin cá nhân</h2>
                    <p>VaiMix thu thập và sử dụng thông tin cá nhân của người dùng nhằm mục đích cung cấp, duy trì, và cải tiến dịch vụ quản lý đa nền tảng mạng xã hội. Các mục đích chính bao gồm:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Tạo và quản lý tài khoản người dùng trên nền tảng VaiMix.</li>
                        <li>Đăng tải nội dung (bài viết, hình ảnh, video) lên các tài khoản mạng xã hội được liên kết (như TikTok, Facebook, LinkedIn, X, v.v.) theo sự ủy quyền và thao tác trực tiếp của người dùng.</li>
                        <li>Cung cấp tính năng phân tích hiệu suất và báo cáo dữ liệu.</li>
                        <li>Nhận diện người dùng để cung cấp quyền truy cập an toàn và bảo mật vào hệ thống.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">2. Phạm vi sử dụng thông tin</h2>
                    <p>Hệ thống chỉ sử dụng thông tin cá nhân và dữ liệu liên kết từ người dùng đối với các mục đích:
                        - Quản lý và xử lý lịch trình đăng bài.
                        - Yêu cầu cấp quyền Access Token thông qua OAuth an toàn từ các bên thứ 3 (như TikTok Login Kit, Graph API) để thực hiện thao tác tạo lập và phân phối nội dung.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">3. Thời gian lưu trữ thông tin</h2>
                    <p>Dữ liệu và thông tin người dùng (bao gồm Access Tokens của bên thứ 3) sẽ được lưu trữ an toàn trên cơ sở dữ liệu của VaiMix cho đến khi người dùng quyết định hủy kết nối (Disconnect) kênh mạng xã hội hoặc yêu cầu xóa tài khoản khỏi nền tảng VaiMix. Khi có yêu cầu, toàn bộ dữ liệu sẽ được xóa ngay lập tức khỏi hệ thống theo tiêu chuẩn.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">4. Chia sẻ thông tin với bên thứ 3</h2>
                    <p>VaiMix cam kết không chia sẻ, bán, hoặc trao đổi thông tin cá nhân, Access Token, hay dữ liệu riêng tư của người dùng cho bất kỳ bên thứ 3 nào. Dữ liệu chỉ được truyền một chiều trực tiếp từ VaiMix đến nền tảng đích (Ví dụ: TikTok, Facebook) khi người dùng kích hoạt lệnh đăng nội dung.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">5. Cam kết bảo mật</h2>
                    <p>Chúng tôi lưu trữ Token và dữ liệu bằng các thuật toán mã hoá cao cấp (AES-256) và truyền dẫn thông qua giao thức HTTPS. Chỉ có chủ sở hữu tài khoản mới có quyền kích hoạt Access Token của mình. VaiMix áp dụng chuẩn bảo mật dữ liệu an toàn nhất liên tục giám sát máy chủ.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-white">6. Thông tin liên hệ</h2>
                    <p>Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật, vui lòng liên hệ:</p>
                    <p className="mt-2 text-purple-400">Email: hi@vaimix.com</p>
                </section>
            </div>
        </div>
    );
}
