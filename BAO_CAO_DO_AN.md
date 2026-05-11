# LỜI NÓI ĐẦU

Trong bối cảnh chuyển đổi số ngày càng diễn ra mạnh mẽ trong lĩnh vực giáo dục, nhu cầu xây dựng các hệ thống phần mềm hỗ trợ sinh viên không còn dừng lại ở mức quản lý thông tin đơn thuần mà đã mở rộng sang hướng hỗ trợ học tập, quản lý thời gian, theo dõi sức khỏe và tăng cường khả năng tương tác thông minh với dữ liệu. Sinh viên hiện nay không chỉ cần một cổng thông tin để xem lịch học, tài liệu hay điểm số, mà còn cần một môi trường số có thể đồng hành, gợi ý và hỗ trợ ra quyết định trong quá trình học tập và sinh hoạt.

Xuất phát từ yêu cầu thực tiễn đó, đề tài **“Hệ thống web hỗ trợ sinh viên có tích hợp trí tuệ nhân tạo”** được lựa chọn nhằm xây dựng một nền tảng web đa chức năng, trong đó trọng tâm là phục vụ người dùng cuối thông qua các phân hệ học tập, tài liệu, nhắc nhở, sức khỏe, hồ sơ cá nhân, thống kê và quản trị. Trí tuệ nhân tạo trong hệ thống không được xem là sản phẩm độc lập mà chỉ đóng vai trò như một lớp dịch vụ hỗ trợ phía backend, góp phần nâng cao chất lượng tương tác, cung cấp phản hồi thông minh và hỗ trợ xử lý một số nghiệp vụ đặc thù.

Đề tài mang ý nghĩa cả về mặt học thuật lẫn thực tiễn. Về mặt học thuật, đề tài giúp vận dụng kiến thức về phân tích hệ thống, thiết kế phần mềm, lập trình web hiện đại, quản lý dữ liệu, xác thực người dùng, tích hợp dịch vụ và kiểm thử phần mềm. Về mặt thực tiễn, đề tài hướng tới việc xây dựng một nền tảng có thể hỗ trợ sinh viên trong môi trường học tập số, đồng thời có khả năng mở rộng để phục vụ nhiều trường hoặc nhiều phân hệ khác nhau.

Báo cáo này trình bày đầy đủ cơ sở lý thuyết, quá trình phân tích, thiết kế, xây dựng, triển khai và đánh giá hệ thống. Nội dung được trình bày theo văn phong báo cáo đồ án chuyên ngành Công nghệ Thông tin, tập trung làm rõ vai trò của hệ thống web, kiến trúc triển khai, các chức năng nghiệp vụ cốt lõi và cách trí tuệ nhân tạo được tích hợp như một thành phần hỗ trợ trong toàn bộ nền tảng.

---

# MỤC LỤC

1. MỞ ĐẦU  
2. CHƯƠNG 1. CƠ SỞ LÝ THUYẾT  
3. CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG  
4. CHƯƠNG 3. XÂY DỰNG VÀ TRIỂN KHAI HỆ THỐNG  
5. KẾT LUẬN  
6. TÀI LIỆU THAM KHẢO  

---

# MỞ ĐẦU

## 1. Lý do chọn đề tài

Trong quá trình học tập, sinh viên phải đồng thời quản lý nhiều nhóm thông tin khác nhau như lịch học, bài tập, tài liệu, tiến độ học tập, nhắc nhở công việc cá nhân, thông tin sức khỏe và các hoạt động học thuật khác. Việc sử dụng nhiều công cụ rời rạc khiến dữ liệu bị phân tán, làm giảm hiệu quả khai thác thông tin và gây khó khăn trong việc xây dựng một trải nghiệm học tập thống nhất.

Trong khi đó, sự phát triển của công nghệ web hiện đại và trí tuệ nhân tạo mở ra khả năng xây dựng các nền tảng hỗ trợ sinh viên toàn diện hơn. Một hệ thống web nếu được tổ chức hợp lý có thể đóng vai trò là cổng truy cập tập trung, nơi người dùng không chỉ xem dữ liệu mà còn tương tác, nhận gợi ý và được hỗ trợ thông minh trong nhiều tình huống khác nhau.

Lý do chọn đề tài xuất phát từ ba khía cạnh chính:

- nhu cầu thực tế về một nền tảng số hỗ trợ sinh viên toàn diện;
- khả năng ứng dụng các công nghệ web hiện đại vào xây dựng hệ thống thực tế;
- tiềm năng tích hợp trí tuệ nhân tạo như một công cụ hỗ trợ nâng cao trải nghiệm người dùng.

Vì vậy, đề tài được lựa chọn với định hướng xây dựng một **hệ thống web hỗ trợ sinh viên**, trong đó trí tuệ nhân tạo chỉ là thành phần hỗ trợ phía sau, không làm thay đổi trọng tâm của sản phẩm chính.

## 2. Mục tiêu nghiên cứu

Mục tiêu tổng quát của đề tài là xây dựng một hệ thống web hỗ trợ sinh viên có cấu trúc rõ ràng, có khả năng mở rộng và tích hợp trí tuệ nhân tạo ở mức dịch vụ backend.

Các mục tiêu cụ thể gồm:

- phân tích nhu cầu và bài toán xây dựng hệ thống web hỗ trợ sinh viên;
- thiết kế kiến trúc tổng thể cho web frontend, backend và cơ sở dữ liệu;
- xây dựng các chức năng chính như xác thực, dashboard, học tập, tài liệu, nhắc nhở, sức khỏe, hồ sơ và quản trị;
- tổ chức backend theo hướng rõ ràng, dễ mở rộng và tích hợp được AI;
- đánh giá hệ thống dựa trên cấu trúc mã nguồn, chức năng đã xây dựng và khả năng triển khai thực tế.

## 3. Đối tượng nghiên cứu

Đối tượng nghiên cứu của đề tài bao gồm:

- hệ thống web hỗ trợ sinh viên;
- các công nghệ phát triển frontend và backend hiện đại;
- mô hình dữ liệu phục vụ nghiệp vụ người dùng;
- cơ chế xác thực và quản lý phiên làm việc;
- cách tích hợp trí tuệ nhân tạo vào một nền tảng web có sẵn;
- hệ sinh thái mở rộng sang thiết bị di động.

## 4. Phạm vi nghiên cứu

Đề tài tập trung nghiên cứu trong phạm vi sau:

- xây dựng ứng dụng web cho người dùng cuối và quản trị viên;
- xây dựng backend API phục vụ web và mobile;
- thiết kế cơ sở dữ liệu quan hệ bằng PostgreSQL và Prisma ORM;
- tích hợp AI ở mức dịch vụ hỗ trợ hội thoại và gợi ý;
- xem mobile app là thành phần mở rộng trong hệ sinh thái, không phải trọng tâm chính của báo cáo.

Đề tài không tập trung nghiên cứu vào:

- huấn luyện mô hình AI mới;
- xây dựng một nền tảng AI runner độc lập;
- đánh giá benchmark hiệu năng chi tiết khi chưa có số liệu đo thực tế.

## 5. Phương pháp nghiên cứu

Các phương pháp nghiên cứu được sử dụng trong đề tài gồm:

- **phương pháp khảo sát và phân tích yêu cầu**: xác định bài toán, nhu cầu và nhóm chức năng chính của hệ thống;
- **phương pháp thiết kế hệ thống**: thiết kế kiến trúc tổng thể, frontend, backend, dữ liệu và API;
- **phương pháp xây dựng thực nghiệm**: triển khai các thành phần bằng công nghệ web hiện đại;
- **phương pháp kiểm thử**: đánh giá chức năng đã xây dựng thông qua test backend và rà soát luồng xử lý;
- **phương pháp tổng hợp và đánh giá**: rút ra nhận xét về ưu điểm, hạn chế và hướng phát triển.

## 6. Nội dung nghiên cứu

Nội dung nghiên cứu của đề tài bao gồm:

- tìm hiểu các công nghệ dùng để xây dựng hệ thống web hiện đại;
- nghiên cứu vai trò của backend, cơ sở dữ liệu và frontend trong hệ thống hỗ trợ sinh viên;
- nghiên cứu cách tích hợp AI như lớp dịch vụ hỗ trợ;
- phân tích yêu cầu và thiết kế hệ thống;
- triển khai các phân hệ chức năng chính;
- kiểm thử và đánh giá kết quả xây dựng.

## 7. Kết cấu đề tài

Báo cáo được chia thành ba chương chính:

- **Chương 1** trình bày cơ sở lý thuyết liên quan đến hệ thống web hỗ trợ sinh viên, công nghệ sử dụng, dữ liệu và kiểm thử phần mềm.
- **Chương 2** trình bày quá trình phân tích và thiết kế hệ thống, từ mô tả bài toán đến kiến trúc, dữ liệu, API, giao diện và bảo mật.
- **Chương 3** trình bày việc xây dựng và triển khai hệ thống, mô tả môi trường phát triển, cấu trúc thư mục, các chức năng đã triển khai, kiểm thử và đánh giá.

---

# CHƯƠNG 1. CƠ SỞ LÝ THUYẾT

## 1.1. Tổng quan về hệ thống web hỗ trợ sinh viên

Hệ thống web hỗ trợ sinh viên là một dạng hệ thống thông tin tích hợp, được xây dựng nhằm cung cấp môi trường số phục vụ nhiều nhu cầu học tập và sinh hoạt của người học trong cùng một nền tảng. Không giống các website giới thiệu đơn thuần, loại hệ thống này có tính tương tác cao, yêu cầu quản lý dữ liệu cá nhân, dữ liệu học tập, trạng thái người dùng và nhiều quy trình nghiệp vụ liên quan.

Một hệ thống web hỗ trợ sinh viên hiện đại thường bao gồm các thành phần:
- xác thực và quản lý tài khoản;
- dashboard tổng hợp thông tin;
- lịch học, tài liệu, môn học, điểm số;
- nhắc nhở và thông báo;
- hồ sơ cá nhân;
- các tính năng mở rộng như sức khỏe, thống kê, cộng đồng hoặc trí tuệ nhân tạo.

Điểm quan trọng nhất của hệ thống dạng này là khả năng gom nhiều hoạt động học đường vào một cổng truy cập thống nhất. Nhờ đó, người dùng không cần chuyển đổi giữa quá nhiều công cụ riêng lẻ.

[Hình 1.1 – Mô hình tổng quan hệ thống web hỗ trợ sinh viên]

## 1.2. Tổng quan về ứng dụng web hiện đại

Ứng dụng web hiện đại không còn chỉ là tập hợp các trang HTML tĩnh mà thường được xây dựng dưới dạng ứng dụng tương tác, phân tách thành frontend và backend rõ ràng. Frontend đảm nhiệm trải nghiệm người dùng, trong khi backend chịu trách nhiệm xử lý nghiệp vụ, bảo mật, dữ liệu và tích hợp dịch vụ.

Các đặc trưng của ứng dụng web hiện đại gồm:

- giao diện theo hướng component hóa;
- điều hướng động và phân trang hợp lý;
- quản lý state phía client;
- giao tiếp với backend qua API;
- xác thực phiên làm việc;
- khả năng responsive trên nhiều loại thiết bị;
- khả năng tích hợp dịch vụ ngoài.

Trong đề tài này, hệ thống web hỗ trợ sinh viên được xây dựng đúng theo định hướng đó. Web frontend được phát triển bằng Next.js, React và TypeScript; backend được xây dựng bằng Node.js và Express; dữ liệu được quản lý bởi PostgreSQL và Prisma ORM.

## 1.3. Công nghệ frontend sử dụng trong hệ thống

### 1.3.1. Next.js

Next.js là framework phát triển ứng dụng React theo cấu trúc rõ ràng, hỗ trợ routing theo thư mục và phù hợp với các hệ thống web có nhiều màn hình chức năng. Việc sử dụng Next.js giúp ứng dụng có kiến trúc frontend rõ ràng hơn, dễ phân tách trang và dễ bảo trì.

### 1.3.2. React

React là thư viện xây dựng giao diện dựa trên component. Với hệ thống có nhiều phần giao diện như dashboard, chat, hồ sơ, thống kê, nhắc nhở và quản trị, React cho phép chia nhỏ UI thành các khối tái sử dụng, từ đó tăng tính nhất quán và giảm lặp code.

### 1.3.3. TypeScript

TypeScript giúp kiểm soát kiểu dữ liệu ở phía frontend, từ đó làm giảm lỗi khi tương tác với API, quản lý state hoặc truyền dữ liệu giữa các component. Với dự án có số lượng trang và module lớn, TypeScript là lựa chọn phù hợp để nâng cao tính ổn định và khả năng bảo trì.

### 1.3.4. Tailwind CSS

Tailwind CSS là framework CSS theo hướng utility-first. Việc sử dụng Tailwind giúp xây dựng giao diện nhanh, đồng bộ và thuận tiện khi tổ chức style theo component. Đây là giải pháp phù hợp với ứng dụng web nhiều màn hình, cần tính linh hoạt về bố cục và phản hồi theo kích thước màn hình.

### 1.3.5. Zustand

Zustand là thư viện quản lý state gọn nhẹ. Trong hệ thống này, Zustand được sử dụng để quản lý các trạng thái như phiên đăng nhập, trạng thái ứng dụng, tab đang mở hoặc dữ liệu dùng chung giữa các màn hình. So với các giải pháp nặng hơn, Zustand phù hợp với hệ thống cần state đủ linh hoạt nhưng vẫn muốn giữ cấu trúc đơn giản.

### 1.3.6. Axios và React Hook Form

Axios được dùng để chuẩn hóa giao tiếp với backend. React Hook Form giúp xử lý form như đăng nhập, đăng ký, quên mật khẩu hoặc hoàn thiện hồ sơ hiệu quả hơn. Hai công cụ này làm tăng tính nhất quán trong xử lý request và form data phía client.

[Bảng 1.1 – Vai trò của các công nghệ frontend trong hệ thống]

## 1.4. Công nghệ backend sử dụng trong hệ thống

### 1.4.1. Node.js

Node.js là môi trường chạy JavaScript phía server. Việc sử dụng Node.js trong backend giúp đồng nhất hệ sinh thái ngôn ngữ giữa frontend và backend, thuận lợi cho phát triển fullstack.

### 1.4.2. Express

Express là framework xây dựng API phổ biến trên Node.js. Express hỗ trợ xây dựng route, middleware, xử lý request/response và tổ chức backend theo hướng rõ ràng. Trong hệ thống này, Express đóng vai trò là bộ khung chính cho nhánh backend API có cấu trúc nhiều tầng.

### 1.4.3. Prisma ORM

Prisma ORM giúp định nghĩa schema dữ liệu tập trung và làm việc với PostgreSQL thông qua mô hình đối tượng. Điều này làm cho thao tác với dữ liệu dễ kiểm soát hơn, đồng thời hỗ trợ tốt quá trình mở rộng hệ thống.

### 1.4.4. PostgreSQL

PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mạnh, phù hợp với các hệ thống có nhiều bảng liên kết như người dùng, hồ sơ sinh viên, sức khỏe, nhắc nhở và thông báo. Cấu trúc dữ liệu của đề tài có nhiều quan hệ 1-1 và 1-n, do đó PostgreSQL là lựa chọn hợp lý.

### 1.4.5. JWT, bcrypt, zod, multer, dotenv

- **JWT**: dùng để xác thực và truyền thông tin phiên đăng nhập.
- **bcrypt**: dùng để xử lý mật khẩu theo hướng an toàn hơn so với lưu thô.
- **zod**: dùng để kiểm tra hợp lệ dữ liệu đầu vào.
- **multer**: hỗ trợ xử lý upload tệp.
- **dotenv**: quản lý biến môi trường cho cấu hình hệ thống.

Những công nghệ này tạo nên nền tảng backend đủ để xử lý nhiều nhu cầu của ứng dụng web hiện đại.

## 1.5. Mobile app trong hệ sinh thái hệ thống

Mặc dù trọng tâm của đề tài là web, hệ thống vẫn có mobile app như một thành phần mở rộng trong hệ sinh thái chung. Mobile được xây dựng bằng React Native và Expo, sử dụng cùng backend API với web.

Vai trò của mobile app gồm:
- mở rộng khả năng truy cập hệ thống trên thiết bị di động;
- tái sử dụng dữ liệu và nghiệp vụ từ backend;
- hỗ trợ các tình huống cần truy cập nhanh như xem lịch, chat, thông báo hoặc hồ sơ.

Việc có mobile app trong cùng hệ sinh thái cho thấy hệ thống được thiết kế theo hướng mở rộng đa nền tảng, nhưng điều đó không làm thay đổi trọng tâm chính của đề tài là **ứng dụng web hỗ trợ sinh viên**.

## 1.6. Trí tuệ nhân tạo trong hệ thống hỗ trợ sinh viên

Trong hệ thống này, trí tuệ nhân tạo không phải là sản phẩm chính mà chỉ là một **lớp dịch vụ hỗ trợ phía backend**. Vai trò của AI nằm ở các nhiệm vụ như:

- hỗ trợ hội thoại với người dùng;
- gợi ý nội dung học tập hoặc hành động;
- cung cấp phản hồi thông minh dựa trên yêu cầu nhập vào;
- hỗ trợ xử lý tài liệu hoặc ảnh ở mức tương tác.

Điểm cần nhấn mạnh là hệ thống không được xây dựng như một AI runner độc lập. AI chỉ là một thành phần được tích hợp để nâng cao trải nghiệm của nền tảng web. Vì vậy, khi mô tả phần này trong báo cáo, cần tập trung vào:

- vai trò của AI trong luồng backend;
- giá trị mà AI đem lại cho người dùng web;
- cách tích hợp AI như một dịch vụ, không phải một trung tâm của kiến trúc.

[Hình 1.2 – Vai trò của lớp AI integration trong kiến trúc hệ thống]

## 1.7. Cơ sở dữ liệu và quản lý dữ liệu

Hệ thống sử dụng mô hình dữ liệu quan hệ kết hợp với Prisma ORM để quản lý cấu trúc dữ liệu. Các nhóm bảng chính gồm:

- người dùng và xác thực;
- hồ sơ sinh viên;
- sức khỏe và các loại log sức khỏe;
- nhắc nhở và thông báo.

Việc chuẩn hóa dữ liệu thành nhiều bảng nhỏ mang lại các lợi ích:
- dễ mở rộng;
- dễ truy vấn và thống kê;
- hạn chế trùng lặp;
- tăng tính rõ ràng trong mô hình nghiệp vụ.

Ngoài dữ liệu quan hệ, hệ thống còn có dấu vết của các chế độ demo hoặc dữ liệu cục bộ để phục vụ quá trình phát triển. Điều này cho thấy hệ thống được phát triển theo hướng vừa hỗ trợ demo nhanh, vừa từng bước tiến tới kiến trúc dữ liệu chặt chẽ hơn.

## 1.8. Kiểm thử phần mềm

Kiểm thử phần mềm là bước quan trọng để xác minh các chức năng đã xây dựng có hoạt động đúng như mong đợi hay không. Trong phạm vi hệ thống hiện có, backend đã có test cho một số module quan trọng như:

- module sức khỏe;
- module reminder và notification.

Ý nghĩa của việc có test là:
- xác minh schema dữ liệu;
- xác minh luồng xử lý nghiệp vụ;
- giảm rủi ro lỗi khi thay đổi mã nguồn;
- tăng độ tin cậy khi mở rộng hệ thống.

Tuy chưa có đầy đủ số liệu kiểm thử hiệu năng hoặc bộ kiểm thử end-to-end cho toàn bộ giao diện web, nhưng phần test hiện có vẫn là cơ sở quan trọng để đánh giá mức độ hoàn thiện ban đầu của hệ thống.

---

# CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 2.1. Mô tả bài toán

Sinh viên hiện phải quản lý nhiều luồng thông tin khác nhau như lịch học, bài tập, tài liệu, điểm số, công việc cá nhân, nhắc nhở, sức khỏe và các tương tác học thuật. Nếu các thành phần này tồn tại rời rạc trên nhiều nền tảng, người dùng sẽ khó tổng hợp thông tin và mất nhiều thời gian chuyển đổi giữa các công cụ.

Bài toán đặt ra là xây dựng một hệ thống web có thể tập trung các nhu cầu đó trong cùng một nền tảng, đồng thời cung cấp khả năng hỗ trợ thông minh thông qua lớp AI backend mà không làm cho hệ thống bị lệch thành một sản phẩm AI thuần túy.

## 2.2. Mục tiêu hệ thống

Mục tiêu của hệ thống bao gồm:

- xây dựng một cổng web hỗ trợ sinh viên đa chức năng;
- tổ chức dữ liệu người dùng và nghiệp vụ thành mô hình rõ ràng;
- cung cấp dashboard tổng quan và các phân hệ riêng biệt;
- hỗ trợ xác thực, bảo mật và phân quyền;
- cho phép tích hợp AI như một dịch vụ hỗ trợ hội thoại và gợi ý;
- tạo nền tảng có thể mở rộng sang mobile và quản trị theo trường.

## 2.3. Xác định yêu cầu hệ thống

### 2.3.1. Yêu cầu chức năng

Hệ thống cần đáp ứng các yêu cầu chức năng sau:

#### a) Nhóm xác thực
- chọn trường;
- đăng ký tài khoản;
- đăng nhập;
- quên mật khẩu;
- xác minh mã khôi phục;
- đặt lại mật khẩu;
- hoàn thiện hồ sơ;
- xem thông tin tài khoản hiện tại;
- đăng xuất.

#### b) Nhóm dashboard và học tập
- hiển thị dashboard tổng quan;
- xem lịch học;
- xem tài liệu;
- xem khóa học hoặc đầu việc học tập;
- xem điểm số;
- điều hướng nhanh sang các phân hệ liên quan.

#### c) Nhóm chat AI
- tạo hội thoại mới;
- xem lịch sử hội thoại;
- gửi câu hỏi văn bản;
- tải ảnh và tài liệu lên;
- nhận phản hồi AI;
- xem trạng thái kết nối AI;
- hiển thị nội dung phản hồi dạng markdown.

#### d) Nhóm nhắc nhở và thông báo
- tạo reminder;
- sửa/xóa reminder;
- xem notification;
- đánh dấu notification đã đọc;
- quản lý push token;
- hỗ trợ job xử lý nhắc nhở đến hạn.

#### e) Nhóm sức khỏe
- quản lý hồ sơ sức khỏe;
- cập nhật cân nặng;
- tính BMI;
- theo dõi giấc ngủ;
- quản lý dinh dưỡng;
- theo dõi tập luyện;
- theo dõi tâm trạng;
- nhận gợi ý an toàn từ AI;
- xem thống kê sức khỏe.

#### f) Nhóm hồ sơ cá nhân
- xem hồ sơ người dùng;
- điều chỉnh thông tin cơ bản;
- quản lý phiên truy cập;
- hiển thị vai trò và ngữ cảnh người dùng.

#### g) Nhóm quản trị
- đăng nhập admin;
- xem dashboard theo trường;
- quản lý sinh viên;
- quản lý giáo viên;
- theo dõi dữ liệu quản trị.

[Bảng 2.1 – Danh sách yêu cầu chức năng của hệ thống]

### 2.3.2. Yêu cầu phi chức năng

Hệ thống cần đáp ứng các yêu cầu phi chức năng sau:

- giao diện rõ ràng, dễ sử dụng;
- hỗ trợ responsive;
- thời gian phản hồi hợp lý trong điều kiện triển khai thông thường;
- có khả năng mở rộng module;
- bảo mật thông tin xác thực;
- cấu trúc mã nguồn dễ bảo trì;
- hỗ trợ đa trường và nhiều vai trò;
- khả năng tích hợp dịch vụ ngoài như AI hoặc push notification.

## 2.4. Phân tích tác nhân sử dụng hệ thống

Các tác nhân chính của hệ thống gồm:

### 2.4.1. Sinh viên / học sinh
Đây là nhóm người dùng trung tâm, sử dụng web để đăng nhập, xem dashboard, học tập, chat AI, quản lý nhắc nhở, theo dõi sức khỏe và thông tin cá nhân.

### 2.4.2. Quản trị viên
Quản trị viên sử dụng hệ thống để theo dõi dữ liệu theo trường, quản lý người dùng, quản lý các phân hệ liên quan và giám sát hoạt động chung.

### 2.4.3. Backend API
Backend không phải người dùng, nhưng là tác nhân hệ thống nội bộ chịu trách nhiệm điều phối dữ liệu, xử lý nghiệp vụ và bảo mật.

### 2.4.4. Dịch vụ AI
AI đóng vai trò là dịch vụ hỗ trợ phía backend. Nó không tự vận hành như một ứng dụng độc lập, mà chỉ phản hồi các yêu cầu do hệ thống backend gửi tới.

### 2.4.5. Dịch vụ thông báo đẩy
Dịch vụ này tham gia khi hệ thống cần thông báo đến thiết bị hoặc hỗ trợ push notification.

[Hình 2.1 – Sơ đồ tác nhân sử dụng hệ thống]

## 2.5. Phân tích chức năng chính

### 2.5.1. Cổng chọn trường
Cổng chọn trường giúp hệ thống phân luồng người dùng tới đúng ngữ cảnh truy cập, branding và cấu hình phù hợp. Điều này phản ánh định hướng multi-school của hệ thống.

### 2.5.2. Xác thực người dùng
Xác thực là chức năng nền tảng để bảo vệ hệ thống và cá nhân hóa trải nghiệm. Đây là lớp đầu tiên kiểm soát quyền truy cập.

### 2.5.3. Dashboard tổng quan
Dashboard là màn hình trung tâm sau đăng nhập. Chức năng này tập hợp các dữ liệu quan trọng nhất để người dùng nhanh chóng nắm được tình trạng học tập và sinh hoạt.

### 2.5.4. Nhóm học tập
Bao gồm lịch học, tài liệu, khóa học, điểm số và các dữ liệu học tập khác. Đây là nhóm nghiệp vụ cốt lõi của hệ thống web hỗ trợ sinh viên.

### 2.5.5. Chat AI
Chat AI là phân hệ hỗ trợ tương tác thông minh với backend. Nó không thay thế hệ thống chính mà đóng vai trò mở rộng để hỗ trợ sinh viên nhanh hơn.

### 2.5.6. Reminder và notification
Nhóm chức năng này tăng tính chủ động cho người dùng, giúp hệ thống mang tính tương tác liên tục chứ không chỉ là nơi xem dữ liệu thụ động.

### 2.5.7. Sức khỏe
Sức khỏe là một mảng tương đối đặc biệt, giúp hệ thống mở rộng phạm vi hỗ trợ từ học tập sang quản lý cá nhân toàn diện.

### 2.5.8. Quản trị
Quản trị theo trường làm cho hệ thống có chiều sâu hơn và phù hợp hơn với bối cảnh vận hành thực tế.

## 2.6. Thiết kế kiến trúc tổng thể hệ thống

Kiến trúc hệ thống gồm bốn lớp chính:

1. **lớp giao diện người dùng**: web frontend và mobile app;
2. **lớp xử lý ứng dụng**: backend API;
3. **lớp dữ liệu**: PostgreSQL và dữ liệu phụ trợ;
4. **lớp dịch vụ tích hợp**: AI, push notification và các dịch vụ ngoài.

Kiến trúc này có ưu điểm:
- rõ trách nhiệm từng lớp;
- dễ mở rộng;
- cho phép nhiều client dùng chung backend;
- AI được cô lập như dịch vụ bổ sung.

[Hình 2.2 – Kiến trúc tổng thể của hệ thống]

## 2.7. Thiết kế frontend

Frontend được thiết kế theo các nguyên tắc:

- tổ chức route theo App Router;
- chia component theo mục đích sử dụng;
- có layout chung toàn ứng dụng;
- có app shell cho trải nghiệm sau đăng nhập;
- có state store riêng cho xác thực và trạng thái ứng dụng;
- có API client dùng chung;
- hỗ trợ responsive desktop/mobile.

`AppShell` đóng vai trò khung xương của giao diện, bao gồm sidebar, topbar, vùng nội dung chính, mobile navigation và menu người dùng. Các page như dashboard, chat, schedule, documents, reminders, health và statistics được hiển thị trong vùng nội dung chính.

## 2.8. Thiết kế backend

Backend được thiết kế theo hướng nhiều tầng:

- `routes`: khai báo endpoint;
- `controllers`: xử lý request/response;
- `services`: xử lý nghiệp vụ;
- `repositories`: giao tiếp với Prisma hoặc tầng dữ liệu;
- `middlewares`: xử lý auth, validation, role và lỗi;
- `config` và `utils`: hỗ trợ cấu hình và tái sử dụng logic.

Thiết kế này làm giảm phụ thuộc giữa các tầng, thuận lợi cho việc bảo trì và mở rộng.

## 2.9. Thiết kế cơ sở dữ liệu

Từ schema hiện có, các nhóm bảng chính bao gồm:

### Nhóm xác thực và người dùng
- User
- StudentProfile
- RefreshToken
- PasswordResetToken

### Nhóm sức khỏe
- HealthProfile
- WeightLog
- SleepLog
- MealLog
- NutritionItem
- WorkoutPlan
- WorkoutLog
- MoodLog

### Nhóm reminder và notification
- Reminder
- Notification

Mô hình dữ liệu này phản ánh đúng các nhóm nghiệp vụ trong hệ thống web.

[Hình 2.3 – Sơ đồ cơ sở dữ liệu của hệ thống]

## 2.10. Thiết kế API

API được chia thành các nhóm chính:

- Auth API;
- AI/Conversation API;
- Health API;
- Reminder/Notification API;
- Statistics API;
- Admin API.

Thiết kế API theo nhóm giúp frontend dễ tổ chức tầng gọi dữ liệu. Đồng thời, việc chuẩn hóa đường dẫn và logic xử lý lỗi ở phía client giúp giao tiếp frontend-backend ổn định hơn.

[Bảng 2.2 – Nhóm API chính của hệ thống]

## 2.11. Thiết kế giao diện

Giao diện được thiết kế theo hướng:

- có dashboard trung tâm;
- có điều hướng trái cho desktop;
- có điều hướng dưới cho mobile;
- dùng thẻ thông tin, khu vực phân nhóm và màu sắc nhất quán;
- giữ cho AI chỉ là một phân hệ trong toàn bộ nền tảng.

Các màn hình chính gồm:
- cổng chọn trường;
- đăng nhập / đăng ký / quên mật khẩu;
- dashboard;
- lịch học;
- tài liệu;
- chat AI;
- nhắc nhở;
- thông báo;
- sức khỏe;
- hồ sơ cá nhân;
- dashboard quản trị.

[Hình 2.4 – Giao diện tổng quát của hệ thống web]

## 2.12. Thiết kế bảo mật

Thiết kế bảo mật của hệ thống bao gồm:

- xác thực bằng token;
- xử lý mật khẩu an toàn với bcrypt;
- tách quyền truy cập giữa người dùng và admin;
- kiểm tra dữ liệu đầu vào bằng zod;
- quản lý token theo school và session;
- cấu hình biến môi trường bằng dotenv;
- bảo vệ route qua logic frontend và backend.

Mặc dù chưa có phần đánh giá chuyên sâu về bảo mật ở mức pentest, các cơ chế hiện tại vẫn thể hiện hướng thiết kế tương đối hợp lý cho một hệ thống web hỗ trợ sinh viên.

---

# CHƯƠNG 3. XÂY DỰNG VÀ TRIỂN KHAI HỆ THỐNG

## 3.1. Môi trường phát triển

Hệ thống được phát triển trong môi trường gồm:

- Node.js cho backend và frontend tooling;
- Next.js/React/TypeScript cho web;
- Express/Prisma/PostgreSQL cho backend;
- Expo/React Native cho mobile;
- các gói thư viện hỗ trợ như Zustand, Axios, React Hook Form, JWT, bcrypt, zod, multer, dotenv.

## 3.2. Cấu trúc thư mục dự án

Cấu trúc tổng quát của dự án như sau:

```text
NemoClaw/
├── apps/client-react/
├── apps/mobile/
├── packages/backend/
├── README.md
└── BAO_CAO_DO_AN.md
```

Trong đó:
- `apps/client-react/` chứa web frontend;
- `apps/mobile/` chứa mobile app;
- `packages/backend/` chứa backend API, schema và test.

[Bảng 3.1 – Cấu trúc thư mục chính của dự án]

## 3.3. Xây dựng web frontend

Web frontend được xây dựng theo hướng module hóa rõ ràng.

### Các lớp tổ chức chính
- route layer trong `src/app/`;
- component layer trong `src/components/`;
- page component trong `src/components/pages/`;
- store/hook layer trong `src/hooks/`;
- API support layer trong `src/lib/`;
- context/provider layer trong `src/contexts/` và provider component.

### Vai trò của từng lớp
Thiết kế này giúp frontend tránh bị dồn toàn bộ logic vào page, từ đó tăng khả năng bảo trì và tái sử dụng.

## 3.4. Xây dựng backend API

Backend API được xây dựng bằng Node.js và Express theo kiến trúc nhiều tầng. File app chính cấu hình:

- middleware request id;
- parse JSON;
- CORS;
- health check;
- route auth;
- route document;
- middleware lỗi và not found.

Từ kiến trúc đó, backend có thể tiếp tục mở rộng thêm các route nghiệp vụ khác phục vụ frontend và mobile.

## 3.5. Xây dựng cơ sở dữ liệu

Cơ sở dữ liệu được thiết kế trên PostgreSQL thông qua Prisma schema. Cách tiếp cận này giúp:
- mô hình hóa nghiệp vụ rõ ràng;
- duy trì được tính quan hệ giữa dữ liệu;
- mở rộng các nhóm chức năng như sức khỏe, reminder, notification dễ hơn.

Trong quá trình xây dựng, Prisma còn đóng vai trò cầu nối giữa mã nguồn backend và cơ sở dữ liệu thực tế.

## 3.6. Xây dựng chức năng xác thực

Chức năng xác thực được tổ chức quanh các luồng sau:

- đăng ký;
- đăng nhập;
- hoàn thiện hồ sơ;
- quên mật khẩu;
- xác minh mã;
- đặt lại mật khẩu;
- đồng bộ phiên từ storage;
- logout.

Ở frontend, phần xác thực được gom vào `useAuthStore`, giúp toàn bộ các màn hình có thể truy cập cùng một nguồn trạng thái. Ở backend, các endpoint xác thực xử lý token, người dùng và dữ liệu đăng nhập.

## 3.7. Xây dựng chức năng dashboard và học tập

Dashboard được thiết kế như điểm trung tâm sau khi người dùng đăng nhập thành công. Giao diện dashboard hiện có các khu vực:

- học tập;
- công việc;
- sức khỏe;
- gợi ý AI;
- lịch học trong ngày;
- việc cần làm.

Bên cạnh dashboard, các phân hệ học tập khác như schedule, documents, courses, grades tạo thành nhóm chức năng học đường cốt lõi. Đây là phần thể hiện rõ nhất giá trị của hệ thống web hỗ trợ sinh viên.

## 3.8. Xây dựng chức năng chat AI

Chat AI là một phân hệ có mức độ hoàn thiện cao về mặt giao diện và trải nghiệm. Chức năng này bao gồm:

- danh sách hội thoại;
- hội thoại mới;
- nhập văn bản;
- đính kèm ảnh;
- đính kèm tài liệu;
- hiển thị phản hồi markdown;
- trạng thái engine AI;
- gợi ý prompt;
- giao diện riêng cho desktop và mobile.

Điều cần nhấn mạnh là chat AI chỉ là **một phân hệ của web**, không phải toàn bộ sản phẩm. Vai trò của nó là hỗ trợ người dùng tương tác thông minh hơn với hệ thống.

[Hình 3.1 – Giao diện chức năng chat AI]

## 3.9. Xây dựng chức năng nhắc nhở và thông báo

Chức năng reminder và notification giúp người dùng theo dõi các công việc và sự kiện cần chú ý. Hệ thống hỗ trợ:

- tạo và quản lý reminder;
- hiển thị thông báo;
- đánh dấu đã đọc;
- hỗ trợ push token;
- job sinh notification khi đến hạn.

Đây là nhóm chức năng làm tăng tính tương tác và tính chủ động của hệ thống.

## 3.10. Xây dựng chức năng sức khỏe

Phân hệ sức khỏe được tổ chức tương đối độc lập với các nhóm nghiệp vụ còn lại. Hệ thống hỗ trợ:

- hồ sơ sức khỏe;
- log cân nặng;
- tính BMI;
- log ngủ;
- log bữa ăn;
- log tập luyện;
- log tâm trạng;
- thống kê sức khỏe;
- gợi ý an toàn từ AI.

Việc đưa sức khỏe vào hệ thống làm tăng tính toàn diện cho nền tảng hỗ trợ sinh viên.

## 3.11. Xây dựng chức năng quản trị

Chức năng quản trị được tổ chức theo trường, thể hiện qua các route admin riêng. Điều này cho thấy hệ thống không chỉ phục vụ sinh viên mà còn hướng tới việc hỗ trợ vận hành và giám sát ở cấp quản lý.

Các chức năng quản trị hiện diện trên giao diện gồm:
- dashboard theo trường;
- quản lý sinh viên;
- quản lý giáo viên;
- đăng nhập quản trị.

## 3.12. Xây dựng mobile app

Mobile app được xây dựng bằng React Native và Expo, dùng chung backend API với web. Phần mobile bao gồm navigation, screen, service, store và types. Sự tồn tại của mobile app cho thấy hệ thống có định hướng phát triển đa nền tảng.

Tuy nhiên, trong phạm vi báo cáo này, mobile được xem là thành phần hỗ trợ trong hệ sinh thái, còn trọng tâm chính vẫn là web.

## 3.13. Kiểm thử hệ thống

Trong phạm vi mã nguồn hiện có, backend đã có test cho các nhóm chức năng:

- sức khỏe;
- reminder / notification.

Những test này xác minh:
- schema có đầy đủ model cần thiết;
- API nghiệp vụ hoạt động;
- tính BMI và thống kê được xử lý;
- notification được sinh đúng trong luồng reminder đến hạn.

Đối với các nội dung như hiệu năng, tải chịu tải hoặc kiểm thử giao diện end-to-end, hiện chưa có số liệu đầy đủ, vì vậy không thể khẳng định bằng số liệu cụ thể.

## 3.14. Kết quả đạt được

Từ góc độ phân tích mã nguồn và các chức năng hiện có, hệ thống đã đạt được các kết quả chính sau:

- xây dựng được nền tảng web hỗ trợ sinh viên với kiến trúc tương đối rõ ràng;
- triển khai được frontend nhiều phân hệ;
- xây dựng được backend có tổ chức nhiều tầng;
- thiết kế được mô hình dữ liệu quan hệ phù hợp với nghiệp vụ;
- tích hợp được AI như một lớp dịch vụ hỗ trợ phía backend;
- triển khai được một số test backend để xác minh nghiệp vụ cốt lõi.

## 3.15. Đánh giá hệ thống

### Ưu điểm
- cấu trúc rõ giữa frontend, backend và mobile;
- web được tổ chức bài bản theo route, page component, store và API layer;
- có nhiều chức năng phục vụ trực tiếp sinh viên;
- có khả năng mở rộng sang đa trường;
- AI được tích hợp đúng vai trò hỗ trợ;
- dữ liệu được chuẩn hóa tương đối tốt.

### Hạn chế
- backend còn dấu vết song song giữa demo server và nhánh Express;
- chưa có đủ số liệu benchmark hiệu năng;
- chưa có hệ thống test giao diện end-to-end hoàn chỉnh;
- một số phần giao diện cần đối chiếu thêm với backend implementation để xác nhận mức hoàn thiện cuối cùng.

---

# KẾT LUẬN

## 1. Kết quả đạt được

Đề tài đã phân tích và trình bày được một hệ thống web hỗ trợ sinh viên có tích hợp trí tuệ nhân tạo theo đúng định hướng lấy **web làm trung tâm**, còn AI chỉ đóng vai trò dịch vụ hỗ trợ phía backend. Hệ thống bao gồm frontend hiện đại, backend có cấu trúc, mô hình dữ liệu rõ ràng, phân hệ học tập, nhắc nhở, sức khỏe, chat AI, hồ sơ cá nhân và quản trị.

## 2. Hạn chế

Một số hạn chế của hệ thống hiện tại gồm:
- chưa có bộ số liệu hiệu năng đầy đủ;
- chưa có toàn bộ kiểm thử end-to-end cho frontend;
- backend còn dấu vết song song giữa nhiều hướng triển khai;
- một số mô tả tài liệu cần tiếp tục đồng bộ với trạng thái mã nguồn thực tế.

## 3. Hướng phát triển

Trong tương lai, hệ thống có thể tiếp tục phát triển theo các hướng:

- hoàn thiện hơn các phân hệ học tập và thống kê;
- tăng cường kiểm thử tích hợp và kiểm thử giao diện;
- chuẩn hóa hoàn toàn backend theo một kiến trúc thống nhất;
- mở rộng thêm trải nghiệm đa trường và phân quyền người dùng;
- tiếp tục tích hợp AI theo hướng hỗ trợ mạnh hơn nhưng vẫn giữ trọng tâm ở nền tảng web.

---

# TÀI LIỆU THAM KHẢO

1. Node.js Documentation.  
2. Express Documentation.  
3. Prisma ORM Documentation.  
4. PostgreSQL Documentation.  
5. Next.js Documentation.  
6. React Documentation.  
7. TypeScript Documentation.  
8. Tailwind CSS Documentation.  
9. Zustand Documentation.  
10. Axios Documentation.  
11. React Hook Form Documentation.  
12. React Native Documentation.  
13. Expo Documentation.  
14. JSON Web Token Introduction and Usage.  
15. Tài liệu về kiểm thử phần mềm và thiết kế hệ thống web hiện đại.  
