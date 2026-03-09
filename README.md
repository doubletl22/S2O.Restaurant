S2O Restaurant
CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI
1.1. Bối cảnh và lý do lựa chọn đề tài
Trong những năm gần đây, ngành dịch vụ ăn uống (Food & Beverage – F&B) tại Việt Nam và trên thế giới đang trải qua quá trình chuyển đổi số mạnh mẽ nhằm tối ưu hóa vận hành, giảm chi phí nhân sự và nâng cao trải nghiệm khách hàng. Sự phát triển của công nghệ di động, điện toán đám mây và các nền tảng phần mềm dạng dịch vụ (Software as a Service – SaaS) đã mở ra cơ hội xây dựng các hệ thống quản lý thông minh, có khả năng mở rộng linh hoạt và triển khai nhanh chóng.
Trong mô hình vận hành truyền thống, nhiều nhà hàng vẫn phụ thuộc vào thực đơn giấy và quy trình phục vụ thủ công. Điều này dẫn đến hàng loạt hạn chế như chi phí in ấn cao, khó cập nhật giá và chương trình khuyến mãi, dễ hư hỏng và gây chậm trễ trong việc tiếp nhận đơn hàng. Khách hàng thường phải chờ nhân viên phục vụ để gọi món hoặc thanh toán, làm giảm chất lượng trải nghiệm và hiệu suất phục vụ trong giờ cao điểm.
Sự phổ biến của mã QR trong những năm gần đây đã tạo ra một phương thức mới cho phép khách hàng truy cập thực đơn và đặt món trực tiếp trên thiết bị cá nhân. Tuy nhiên, phần lớn các giải pháp hiện tại mang tính rời rạc, thiếu tính mở rộng và không được xây dựng theo mô hình nền tảng thống nhất. Nhiều hệ thống chỉ phục vụ cho một nhà hàng đơn lẻ, yêu cầu triển khai riêng lẻ, gây tốn kém chi phí hạ tầng và bảo trì.
Bên cạnh đó, nhu cầu của người tiêu dùng hiện đại không chỉ dừng lại ở việc xem thực đơn tại bàn. Khách hàng mong muốn có một ứng dụng tổng hợp cho phép khám phá nhiều nhà hàng, đặt bàn trước, đọc đánh giá, theo dõi lịch sử chi tiêu và nhận gợi ý thông minh phù hợp với sở thích cá nhân. Phần lớn các hệ thống gọi món QR hiện nay chưa đáp ứng được trải nghiệm toàn diện này.
Sự phát triển của trí tuệ nhân tạo (AI), đặc biệt là các mô hình ngôn ngữ lớn (Large Language Models – LLM) và kỹ thuật tìm kiếm ngữ nghĩa (Vector Search), đã tạo điều kiện để xây dựng các hệ thống tư vấn nhà hàng thông minh, chatbot hỗ trợ khách hàng tự động và công cụ phân tích hành vi người dùng. Tuy nhiên, các giải pháp F&B hiện hành hiếm khi tích hợp AI một cách toàn diện ngay từ kiến trúc nền tảng.
Xuất phát từ những vấn đề trên, nhóm thực hiện đề tài lựa chọn xây dựng nền tảng SaaS quản lý nhà hàng thông minh với gọi món QR – Scan2Order (S2O) nhằm cung cấp một hệ sinh thái số hóa hoàn chỉnh cho cả doanh nghiệp nhà hàng và khách hàng cuối.
1.2. Mục tiêu của dự án
Mục tiêu tổng quát của dự án là thiết kế và triển khai một nền tảng phần mềm dạng dịch vụ (SaaS) cho phép nhiều nhà hàng cùng vận hành trên một hệ thống thống nhất, nhưng vẫn đảm bảo cách ly dữ liệu và tùy biến riêng cho từng đơn vị kinh doanh.
Cụ thể, hệ thống hướng đến các mục tiêu sau:
Thứ nhất, số hóa toàn bộ quy trình gọi món tại nhà hàng thông qua QR code, cho phép khách hàng truy cập thực đơn, đặt món, theo dõi trạng thái đơn hàng và yêu cầu thanh toán trực tiếp trên trình duyệt hoặc ứng dụng di động mà không cần cài đặt phần mềm riêng lẻ.
Thứ hai, xây dựng hệ thống quản lý nhà hàng toàn diện bao gồm quản lý thực đơn, bàn ăn, đơn hàng, doanh thu, chi nhánh, phân quyền nhân sự và tích hợp thanh toán, giúp doanh nghiệp tối ưu hóa vận hành và giảm phụ thuộc vào quy trình thủ công.
Thứ ba, phát triển một ứng dụng di động cho khách hàng đóng vai trò như một nền tảng khám phá nhà hàng, cho phép tìm kiếm, đánh giá, đặt bàn trước, lưu lịch sử ăn uống và theo dõi điểm thưởng.
Thứ tư, tích hợp các mô-đun trí tuệ nhân tạo bao gồm chatbot hỏi đáp tự động theo từng nhà hàng và hệ thống gợi ý nhà hàng thông minh dựa trên vị trí, thời tiết, hành vi người dùng và dữ liệu ngữ nghĩa.
Thứ năm, áp dụng kiến trúc multi-tenant SaaS hiện đại nhằm tối ưu chi phí hạ tầng, cho phép triển khai nhanh cho nhiều nhà hàng và dễ dàng mở rộng quy mô hệ thống trong tương lai.
1.3. Phạm vi nghiên cứu và triển khai
Trong khuôn khổ đề tài, hệ thống được triển khai dưới dạng một nền tảng hoàn chỉnh bao gồm:
Một hệ thống Web dành cho quản trị viên nền tảng (Admin) nhằm quản lý các nhà hàng đăng ký, giám sát doanh thu tổng thể, người dùng và cấu hình các mô-đun AI.
Một hệ thống Web dành cho doanh nghiệp nhà hàng cho phép quản lý thực đơn, đơn hàng, bàn ăn, chi nhánh, phân quyền nhân viên và thống kê vận hành.
Một ứng dụng Web nhẹ dành cho khách hàng truy cập thông qua QR code tại bàn ăn, hỗ trợ quy trình gọi món thời gian thực.
Một ứng dụng di động cho khách hàng cuối nhằm khám phá nhà hàng, đặt bàn, đánh giá dịch vụ và tương tác với hệ thống AI.
Một tầng dịch vụ backend theo kiến trúc microservices đảm nhiệm xác thực, quản lý nghiệp vụ, xử lý đơn hàng, lưu trữ dữ liệu và tích hợp AI.
Các mô-đun trí tuệ nhân tạo bao gồm hệ thống chatbot hỏi đáp dựa trên kỹ thuật Retrieval-Augmented Generation (RAG) và hệ thống gợi ý nhà hàng sử dụng tìm kiếm vector kết hợp luật nghiệp vụ.
Phạm vi đề tài tập trung vào thiết kế kiến trúc, mô hình dữ liệu, triển khai nghiệp vụ cốt lõi và tích hợp AI ở mức nền tảng, hướng đến một hệ thống có khả năng triển khai thực tế trong môi trường doanh nghiệp.
1.4. Ý nghĩa khoa học và thực tiễn của đề tài
Về mặt khoa học, đề tài vận dụng các nguyên lý phát triển phần mềm hiện đại bao gồm mô hình SaaS multi-tenant, kiến trúc microservices, thiết kế API phân tán, hệ thống real-time và tích hợp trí tuệ nhân tạo. Qua đó, sinh viên có cơ hội tiếp cận các công nghệ và mô hình triển khai đang được sử dụng rộng rãi trong các hệ thống thương mại quy mô lớn.
Về mặt thực tiễn, hệ thống S2O có tiềm năng ứng dụng cao trong ngành F&B, giúp doanh nghiệp giảm chi phí vận hành, nâng cao trải nghiệm khách hàng và khai thác dữ liệu hiệu quả hơn. Việc tích hợp AI ngay từ nền tảng cho phép mở rộng các dịch vụ thông minh trong tương lai như dự báo nhu cầu, tối ưu thực đơn và cá nhân hóa trải nghiệm người dùng.
CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG
2.1. Mô hình phần mềm dạng dịch vụ (Software as a Service – SaaS)
Phần mềm dạng dịch vụ (SaaS) là mô hình triển khai trong đó ứng dụng được vận hành tập trung trên hạ tầng đám mây và cung cấp cho người dùng thông qua Internet. Thay vì cài đặt riêng lẻ cho từng doanh nghiệp, một nền tảng SaaS cho phép nhiều khách hàng cùng sử dụng chung hệ thống với chi phí thấp hơn, khả năng mở rộng linh hoạt và cập nhật tính năng đồng bộ.
Trong bối cảnh ngành F&B, mô hình SaaS đặc biệt phù hợp do các nhà hàng thường có quy mô vừa và nhỏ, hạn chế về nguồn lực kỹ thuật và ngân sách hạ tầng. Việc triển khai một hệ thống quản lý riêng biệt cho từng đơn vị không chỉ tốn kém mà còn khó bảo trì lâu dài. Nền tảng S2O được thiết kế như một hệ sinh thái SaaS thống nhất, cho phép nhiều nhà hàng đăng ký sử dụng ngay lập tức mà không cần triển khai phần mềm độc lập.
2.2. Kiến trúc Multi-Tenant và cách ly dữ liệu
Multi-tenant architecture là mô hình trong đó một hệ thống duy nhất phục vụ nhiều khách hàng (tenants), nhưng mỗi tenant có dữ liệu và cấu hình riêng biệt. Đây là yếu tố cốt lõi của các nền tảng SaaS hiện đại.
Trong hệ thống S2O, mỗi nhà hàng được xem như một tenant độc lập. Mặc dù cùng chia sẻ hạ tầng backend và dịch vụ API, dữ liệu về thực đơn, đơn hàng, chi nhánh, người dùng và báo cáo doanh thu được cách ly chặt chẽ theo tenant. Cách tiếp cận này vừa tối ưu chi phí vận hành, vừa đảm bảo tính bảo mật và riêng tư giữa các doanh nghiệp.
Multi-tenant cũng giúp nền tảng dễ dàng mở rộng số lượng nhà hàng mà không cần nhân bản toàn bộ hệ thống, đồng thời cho phép cập nhật tính năng đồng loạt trên toàn bộ nền tảng.
2.3. Kiến trúc Microservices và hệ thống phân tán
Microservices là kiến trúc trong đó hệ thống được chia thành nhiều dịch vụ nhỏ, mỗi dịch vụ đảm nhiệm một chức năng nghiệp vụ riêng biệt và giao tiếp thông qua API.
Trong dự án S2O, kiến trúc microservices được áp dụng nhằm:
•	Tách biệt các nghiệp vụ quan trọng như xác thực người dùng, quản lý nhà hàng, xử lý đơn hàng, AI services và báo cáo.
•	Cho phép từng dịch vụ mở rộng độc lập theo tải sử dụng.
•	Tăng khả năng bảo trì và phát triển tính năng mới.
Mỗi service được triển khai như một ứng dụng backend riêng, giao tiếp thông qua REST API và được quản lý tập trung thông qua hệ thống gateway hoặc cơ chế định tuyến API.
Cách tiếp cận này phản ánh mô hình triển khai thực tế trong các hệ thống thương mại lớn như nền tảng thương mại điện tử, hệ thống ngân hàng số và các dịch vụ đám mây hiện đại.
2.4. Công nghệ Backend và xử lý nghiệp vụ
2.4.1. Nền tảng .NET cho các dịch vụ nghiệp vụ chính
Các dịch vụ nghiệp vụ cốt lõi của hệ thống như quản lý người dùng, nhà hàng, đơn hàng, thanh toán và báo cáo được triển khai bằng nền tảng .NET. Lý do lựa chọn .NET bao gồm:
•	Hiệu năng cao và khả năng xử lý song song tốt.
•	Hệ sinh thái mạnh mẽ cho xây dựng API REST.
•	Hỗ trợ tốt cho kiến trúc microservices và container hóa.
Việc sử dụng .NET giúp hệ thống đảm bảo tính ổn định khi xử lý khối lượng lớn đơn hàng theo thời gian thực trong môi trường nhà hàng.
2.4.2. Python cho mô-đun trí tuệ nhân tạo
Python được sử dụng để phát triển các dịch vụ AI bao gồm chatbot hỏi đáp và hệ thống gợi ý nhà hàng. Đây là lựa chọn phổ biến trong lĩnh vực trí tuệ nhân tạo nhờ:
•	Hệ sinh thái thư viện AI phong phú.
•	Dễ dàng tích hợp với mô hình ngôn ngữ lớn và hệ thống vector search.
•	Phù hợp cho các tác vụ xử lý ngôn ngữ tự nhiên và phân tích dữ liệu.
Các mô-đun AI được triển khai như các microservices độc lập, giao tiếp với backend chính thông qua API.
2.5. Hệ quản trị cơ sở dữ liệu và lưu trữ dữ liệu
2.5.1. PostgreSQL cho dữ liệu nghiệp vụ quan hệ
PostgreSQL được sử dụng để lưu trữ dữ liệu nghiệp vụ cốt lõi như người dùng, nhà hàng, thực đơn, đơn hàng, chi nhánh và lịch sử giao dịch. Đây là hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ:
•	Tính toàn vẹn dữ liệu cao.
•	Truy vấn phức tạp hiệu quả.
•	Khả năng mở rộng tốt cho hệ thống SaaS.
Việc sử dụng PostgreSQL phù hợp với các bài toán quản lý nghiệp vụ có quan hệ chặt chẽ giữa các thực thể.
2.5.2. MongoDB cho dữ liệu phi cấu trúc
Một số dữ liệu linh hoạt như nội dung chatbot, lịch sử hội thoại, log AI và metadata được lưu trữ bằng MongoDB. Cách tiếp cận này cho phép:
•	Lưu trữ dữ liệu không cố định cấu trúc.
•	Mở rộng nhanh khi khối lượng dữ liệu tăng.
•	Phù hợp cho dữ liệu AI và phân tích hành vi người dùng.
2.5.3. Qdrant cho tìm kiếm vector và AI recommendation
Qdrant là hệ thống cơ sở dữ liệu vector được sử dụng cho các bài toán tìm kiếm ngữ nghĩa trong mô-đun AI. Các embedding của nhà hàng, món ăn và hành vi người dùng được lưu trữ dưới dạng vector để phục vụ:
•	Gợi ý nhà hàng thông minh.
•	Tìm kiếm thực đơn theo ngữ nghĩa.
•	Hỗ trợ chatbot truy xuất thông tin chính xác.
Việc tích hợp Qdrant cho phép hệ thống triển khai các tính năng AI hiện đại với hiệu suất cao.
2.6. Redis và xử lý real-time
Redis được sử dụng như hệ thống cache và hỗ trợ real-time communication nhằm:
•	Lưu session tạm thời cho khách truy cập QR menu.
•	Cache dữ liệu thực đơn nhằm giảm tải truy vấn database.
•	Hỗ trợ cập nhật trạng thái đơn hàng theo thời gian thực.
Điều này giúp hệ thống phản hồi nhanh, giảm độ trễ và cải thiện trải nghiệm người dùng trong môi trường nhà hàng đông khách.
2.7. Công nghệ Frontend và trải nghiệm người dùng
2.7.1. Web Application với React và NextJS
Các giao diện Web cho Admin, nhà hàng và khách QR menu được xây dựng bằng React kết hợp NextJS. Lựa chọn này mang lại:
•	Giao diện hiện đại, tương tác nhanh.
•	Khả năng render tối ưu cho SEO và hiệu năng.
•	Dễ dàng mở rộng thành các dashboard phức tạp.
2.7.2. Mobile Application với React Native
Ứng dụng di động cho khách hàng được phát triển bằng React Native, cho phép:
•	Dùng chung logic với Web frontend.
•	Triển khai đa nền tảng Android và iOS.
•	Tối ưu thời gian phát triển.
2.8. Container hóa và triển khai hệ thống
Docker được sử dụng để đóng gói toàn bộ microservices, database, AI services và cache thành các container độc lập. Việc container hóa mang lại:
•	Triển khai nhất quán trên nhiều môi trường.
•	Dễ dàng mở rộng hệ thống.
•	Hỗ trợ CI/CD hiệu quả.
Hệ thống có thể được triển khai trên cloud hoặc máy chủ nội bộ tùy theo quy mô vận hành.
2.9. Bảo mật và xác thực người dùng
Hệ thống áp dụng cơ chế xác thực dựa trên JSON Web Token (JWT) kết hợp phân quyền theo vai trò (Role-Based Access Control – RBAC). Mỗi người dùng được gán quyền phù hợp với vai trò như quản trị viên, quản lý nhà hàng, nhân viên hoặc khách hàng.
Dữ liệu truyền giữa client và server được mã hóa thông qua HTTPS, đảm bảo an toàn thông tin trong môi trường Internet.
CHƯƠNG 3. PHÂN TÍCH NGHIỆP VỤ VÀ THIẾT KẾ HỆ THỐNG
3.1. Mô hình nghiệp vụ tổng thể của nền tảng SaaS S2O
Nền tảng Scan2Order được xây dựng như một hệ sinh thái số hóa toàn bộ vòng đời dịch vụ ăn uống, từ giai đoạn khách hàng khám phá nhà hàng, đặt bàn, trải nghiệm tại chỗ cho đến thanh toán và đánh giá sau sử dụng dịch vụ. Toàn bộ quy trình này được tích hợp trên một nền tảng SaaS đa tenant, cho phép nhiều nhà hàng vận hành song song mà không cần triển khai hệ thống riêng lẻ.
Hệ thống đóng vai trò trung gian kết nối ba luồng giá trị chính:
•	Luồng quản trị nền tảng (platform governance)
•	Luồng vận hành nhà hàng (restaurant operation)
•	Luồng trải nghiệm khách hàng (customer journey)
Sự kết nối này tạo nên một chu trình khép kín từ quản lý đến tiêu dùng.
3.2. Business Process Diagram – Luồng nghiệp vụ tổng thể
 
3.3. Use Case phân cấp
3.3.1. Nhóm chức năng khách hàng QR Menu
 
3.3.2. Nhóm chức năng nhà hàng
 
3.3.3. Nhóm chức năng khách hàng Mobile App
 
3.4. Activity Diagram – Quy trình gọi món QR chi tiết
 
3.5. Sequence Diagram – Đặt món và cập nhật real-time
 
3.6. Sequence Diagram – AI Chatbot QA
 
3.7. Logical Data Model (ERD chi tiết)
 
3.8. Deployment Diagram – Mô hình triển khai
 
3.9. Tổng hợp thiết kế hệ thống
Toàn bộ mô hình thiết kế của S2O phản ánh một hệ thống SaaS hiện đại với sự tách biệt rõ ràng giữa trình diễn, xử lý nghiệp vụ và dữ liệu. Việc áp dụng microservices giúp từng chức năng như đặt món, AI, quản lý thực đơn và thanh toán có thể phát triển độc lập, trong khi kiến trúc multi-tenant đảm bảo mở rộng quy mô hiệu quả.
Các sơ đồ UML đã chứng minh hệ thống không chỉ đáp ứng nghiệp vụ gọi món QR đơn giản mà còn mở rộng thành nền tảng quản lý nhà hàng toàn diện tích hợp trí tuệ nhân tạo.
CHƯƠNG 4. KIẾN TRÚC HỆ THỐNG VÀ THIẾT KẾ CHI TIẾT
4.1. Định hướng kiến trúc tổng thể của nền tảng S2O
Hệ thống Scan2Order được thiết kế theo kiến trúc dịch vụ phân tán nhằm đáp ứng các yêu cầu cốt lõi của một nền tảng SaaS hiện đại, bao gồm khả năng mở rộng linh hoạt, cách ly dữ liệu theo tenant, tích hợp AI và xử lý thời gian thực với độ trễ thấp.
Thay vì xây dựng một hệ thống nguyên khối (monolithic), dự án áp dụng mô hình microservices, trong đó mỗi nhóm chức năng nghiệp vụ được triển khai như một dịch vụ độc lập. Các dịch vụ này giao tiếp với nhau thông qua API, cho phép hệ thống phát triển từng phần mà không ảnh hưởng toàn cục.
Song song đó, kiến trúc multi-tenant được tích hợp xuyên suốt ở tầng dữ liệu và xác thực, đảm bảo mỗi nhà hàng hoạt động như một thực thể riêng biệt trên cùng một nền tảng.
4.2. Sơ đồ kiến trúc logic tổng thể
 
4.3. Phân rã microservices theo nghiệp vụ
4.3.1. Auth Service – Xác thực và phân quyền
Dịch vụ xác thực chịu trách nhiệm:
•	Đăng ký và đăng nhập người dùng
•	Phát hành JWT token
•	Kiểm soát vai trò (Admin, Restaurant Staff, Customer)
•	Liên kết người dùng với tenant
Cơ chế này cho phép hệ thống triển khai RBAC xuyên suốt toàn bộ nền tảng SaaS.
4.3.2. Tenant & Restaurant Service – Quản lý nhà hàng đa tenant
Service này xử lý:
•	Đăng ký nhà hàng mới
•	Cấu hình gói dịch vụ SaaS
•	Quản lý chi nhánh
•	Tách biệt dữ liệu theo tenant
Đây là trụ cột đảm bảo khả năng mở rộng nền tảng.
4.3.3. Menu Service – Quản lý thực đơn số
Menu Service chịu trách nhiệm:
•	Tạo và cập nhật món ăn
•	Quản lý danh mục
•	Đồng bộ hiển thị cho QR menu
•	Cache dữ liệu thực đơn qua Redis
Thiết kế này giúp truy xuất menu cực nhanh trong giờ cao điểm.
4.3.4. Order Service – Xử lý đơn hàng real-time
Order Service đảm nhiệm:
•	Tạo đơn hàng từ QR menu
•	Cập nhật trạng thái chế biến
•	Đồng bộ real-time đến khách hàng
•	Lưu lịch sử giao dịch
Redis đóng vai trò trung gian truyền trạng thái tức thời.
4.3.5. AI Services – Trí tuệ nhân tạo tích hợp
Hai mô-đun AI được triển khai độc lập:
•	Chatbot QA sử dụng Retrieval-Augmented Generation
•	Recommendation Engine dựa trên vector search + rule-based
Thiết kế tách rời giúp AI có thể mở rộng riêng biệt khi tải tăng cao.
4.4. Thiết kế Multi-Tenant ở tầng dữ liệu
Hệ thống áp dụng mô hình Shared Database – Logical Isolation, trong đó:
•	Mỗi bảng nghiệp vụ đều chứa TenantId
•	Mọi truy vấn đều filter theo TenantId
•	JWT mang thông tin tenant context
Ví dụ khái quát:
SELECT * FROM Orders
WHERE TenantId = @tenantId;
Cách tiếp cận này:
•	Giảm chi phí hạ tầng
•	Dễ mở rộng
•	Đảm bảo cách ly dữ liệu logic
4.5. Sơ đồ kiến trúc dữ liệu chi tiết
 
Dữ liệu được tổ chức xoay quanh tenant nhằm đảm bảo nguyên tắc SaaS.
4.6. Luồng xử lý API điển hình
Ví dụ luồng đặt món QR:
 
Luồng này đảm bảo:
•	An toàn tenant
•	Phản hồi nhanh
•	Đồng bộ tức thời
4.7. Đảm bảo mở rộng và hiệu năng
Kiến trúc được tối ưu qua:
•	Load balancing API Gateway
•	Stateless microservices
•	Redis caching
•	AI service scaling độc lập
•	Database indexing theo tenant
Điều này cho phép hệ thống phục vụ hàng trăm nhà hàng cùng lúc.
4.8. Tích hợp bảo mật toàn hệ thống
Các lớp bảo mật gồm:
•	JWT Authentication
•	Role-based Access Control
•	Tenant isolation
•	HTTPS encryption
•	API validation
Thiết kế này phù hợp tiêu chuẩn hệ thống SaaS thương mại.
4.9. Đánh giá kiến trúc so với yêu cầu đề tài
Kiến trúc S2O đáp ứng đầy đủ:
•	Multi-tenant SaaS
•	AI integration
•	Real-time ordering
•	Scalable cloud deployment
•	Secure platform design
Qua đó chứng minh hệ thống không chỉ mang tính học thuật mà còn có khả năng triển khai thực tế.
CHƯƠNG 5. TRIỂN KHAI HỆ THỐNG VÀ PHÂN TÍCH SOURCE CODE
5.1. Tổng quan cấu trúc triển khai của dự án S2O
Hệ thống Scan2Order được triển khai theo mô hình đa dịch vụ (microservices) với sự tách biệt rõ ràng giữa tầng giao diện người dùng, tầng xử lý nghiệp vụ và các mô-đun trí tuệ nhân tạo. Toàn bộ dự án được tổ chức thành nhiều thư mục dịch vụ độc lập, mỗi dịch vụ đảm nhiệm một vai trò nghiệp vụ cụ thể và được container hóa nhằm đảm bảo khả năng triển khai linh hoạt.
Ở tầng frontend, hệ thống bao gồm các ứng dụng Web cho quản trị viên, nhà hàng và khách hàng QR menu, cùng với một ứng dụng di động dành cho người dùng cuối. Các client này giao tiếp với backend thông qua API Gateway hoặc các endpoint REST thống nhất.
Ở tầng backend, mỗi chức năng nghiệp vụ như xác thực, quản lý nhà hàng, thực đơn, đơn hàng và đặt bàn được triển khai dưới dạng service riêng biệt trên nền tảng .NET. Song song đó, các mô-đun AI được xây dựng bằng Python và tích hợp thông qua API.
Cấu trúc này phản ánh đúng kiến trúc SaaS hiện đại được mô tả trong các chương trước.
5.2. Triển khai cơ chế Multi-Tenant trong source code
Một trong những điểm cốt lõi của hệ thống S2O là cách thức hiện thực hóa mô hình multi-tenant ở tầng ứng dụng và cơ sở dữ liệu.
Trong code backend, mỗi request đều mang theo thông tin tenant thông qua JWT token hoặc HTTP header. Thông tin này được trích xuất tại middleware và truyền xuyên suốt vào các tầng xử lý nghiệp vụ.
Ví dụ điển hình trong tầng xử lý API:
var tenantId = HttpContext.User.FindFirst("TenantId")?.Value;
var orders = _dbContext.Orders
    .Where(o => o.TenantId == tenantId)
    .ToList();
Đoạn code trên cho thấy mọi truy vấn dữ liệu đều được ràng buộc theo TenantId, đảm bảo dữ liệu của các nhà hàng không bị truy cập chéo.
Cách tiếp cận này giúp hệ thống duy trì một cơ sở dữ liệu chung nhưng vẫn đảm bảo cách ly logic tuyệt đối giữa các tenant.
5.3. Phân tích triển khai Menu Service
Menu Service đóng vai trò trung tâm trong việc quản lý thực đơn số cho mỗi nhà hàng. Dịch vụ này cho phép tạo mới món ăn, cập nhật giá, phân loại danh mục và đồng bộ hiển thị cho giao diện QR menu.
Một API điển hình trong Menu Service:
[HttpPost]
public async Task<IActionResult> CreateMenuItem(CreateMenuItemDto dto)
{
    var tenantId = GetTenantId();
    var item = new MenuItem
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        Name = dto.Name,
        Price = dto.Price,
        Category = dto.Category,
        IsAvailable = true
    };
    _context.MenuItems.Add(item);
    await _context.SaveChangesAsync();
    return Ok(item);
}
Đoạn xử lý này thể hiện:
•	Gắn dữ liệu thực đơn với tenant cụ thể
•	Lưu trữ theo mô hình quan hệ
•	Cho phép cập nhật thời gian thực
Dữ liệu thực đơn sau khi được lưu sẽ được cache trong Redis nhằm tối ưu tốc độ truy xuất cho khách QR menu.
5.4. Phân tích triển khai Order Service và xử lý real-time
Order Service là thành phần chịu tải lớn nhất trong hệ thống vì xử lý trực tiếp các đơn gọi món từ khách hàng.
Khi khách gửi đơn hàng, backend tạo bản ghi đơn hàng mới và đồng thời phát tín hiệu cập nhật trạng thái qua hệ thống real-time.
Ví dụ logic xử lý đơn hàng:
var order = new Order
{
    Id = Guid.NewGuid(),
    TenantId = tenantId,
    TableId = request.TableId,
    CreatedAt = DateTime.UtcNow,
    Status = "Pending"
};
_context.Orders.Add(order);
await _context.SaveChangesAsync();
await _realtimeHub.NotifyOrderCreated(order);
Cơ chế này đảm bảo:
•	Đơn hàng được lưu vĩnh viễn trong database
•	Trạng thái được đẩy tức thời đến giao diện nhà hàng
•	Khách hàng theo dõi tiến trình ngay lập tức
Redis hoặc WebSocket được sử dụng làm lớp trung gian truyền sự kiện real-time.
5.5. Triển khai QR Menu Web Application
Ứng dụng Web QR Menu được xây dựng bằng React/NextJS và hoạt động theo mô hình session tạm thời.
Khi khách quét QR, frontend gọi API để:
•	Xác định tenant
•	Lấy danh sách món ăn
•	Khởi tạo phiên đặt món
Ví dụ logic frontend:
const res = await fetch(`/api/menu?tenantId=${tenantId}`);
const menuItems = await res.json();
setMenu(menuItems);
Mọi thao tác đặt món sau đó được gửi về Order Service thông qua REST API.
Thiết kế này giúp khách hàng không cần đăng nhập vẫn có thể sử dụng hệ thống một cách mượt mà.
5.6. Phân tích mô-đun AI Chatbot QA
Mô-đun AI được xây dựng bằng Python theo mô hình Retrieval-Augmented Generation.
Quy trình xử lý gồm:
1.	Nhận câu hỏi từ người dùng
2.	Biến đổi câu hỏi thành vector embedding
3.	Truy vấn Qdrant để tìm dữ liệu liên quan
4.	Kết hợp ngữ cảnh với mô hình ngôn ngữ lớn
5.	Trả về câu trả lời tự nhiên
Ví dụ xử lý trong AI Service:
results = vector_db.search(query_embedding, limit=5)
context = "\n".join([r.text for r in results])
response = llm.generate(
    prompt=f"Answer using context:\n{context}\nQuestion:{question}" )
Cách tiếp cận này giúp chatbot trả lời chính xác theo dữ liệu từng nhà hàng thay vì phản hồi chung chung.
5.7. Hệ thống Recommendation Engine
Hệ thống gợi ý nhà hàng hoạt động dựa trên:
•	Embedding ngữ nghĩa nhà hàng
•	Hành vi người dùng
•	Luật nghiệp vụ
Vector search được sử dụng để xác định các nhà hàng phù hợp nhất với ngữ cảnh người dùng như vị trí, thời tiết và lịch sử tiêu dùng.
5.8. Container hóa và triển khai thực tế
Toàn bộ hệ thống được đóng gói bằng Docker với từng service riêng biệt:
services:
  api-gateway:
    build: ./gateway
  order-service:
    build: ./services/order
  menu-service:
    build: ./services/menu
  ai-service:
    build: ./ai
  postgres:
    image: postgres
  redis:
    image: redis
Cách triển khai này giúp:
•	Triển khai nhanh trên cloud
•	Mở rộng linh hoạt
•	Đảm bảo môi trường nhất quán
5.9. Đánh giá mức độ hoàn thiện chức năng
Qua phân tích source code, hệ thống đã triển khai đầy đủ:
•	QR ordering real-time
•	Quản lý nhà hàng đa tenant
•	Ứng dụng web và mobile
•	AI chatbot và gợi ý thông minh
•	Hạ tầng microservices hiện đại
Điều này chứng minh đề tài không chỉ dừng ở mô hình lý thuyết mà đã đạt mức hệ thống ứng dụng thực tế.
CHƯƠNG 6. KIỂM THỬ HỆ THỐNG, BẢO MẬT VÀ ĐÁNH GIÁ HIỆU NĂNG
6.1. Mục tiêu kiểm thử trong hệ thống SaaS S2O
Trong các hệ thống SaaS đa tenant quy mô lớn, kiểm thử không chỉ nhằm phát hiện lỗi chức năng mà còn đảm bảo tính ổn định, bảo mật dữ liệu giữa các tenant và khả năng chịu tải trong môi trường thực tế.
Đối với nền tảng Scan2Order, hoạt động kiểm thử được triển khai xuyên suốt quá trình phát triển nhằm xác minh ba yếu tố trọng tâm:
•	Độ chính xác nghiệp vụ gọi món và quản lý nhà hàng
•	Tính an toàn dữ liệu giữa các tenant
•	Hiệu năng xử lý đơn hàng thời gian thực
Kiểm thử được thực hiện ở nhiều mức độ bao gồm kiểm thử đơn vị (unit testing), kiểm thử tích hợp (integration testing) và kiểm thử hệ thống (system testing).
6.2. Quy trình kiểm thử tổng thể
 
Quy trình trên đảm bảo mỗi chức năng được xác minh từ mức module riêng lẻ đến toàn hệ thống.
6.3. Kiểm thử chức năng nghiệp vụ cốt lõi
Các luồng nghiệp vụ quan trọng được kiểm thử bao gồm:
•	Gọi món QR tại bàn
•	Cập nhật trạng thái đơn hàng real-time
•	Quản lý thực đơn theo tenant
•	Đặt bàn từ mobile app
•	Tương tác với chatbot AI
Mỗi luồng được mô phỏng bằng các kịch bản người dùng thực tế nhằm xác minh hệ thống phản hồi đúng nghiệp vụ trong điều kiện bình thường và tải cao.
6.4. Kiểm thử tích hợp microservices
Do hệ thống được xây dựng theo kiến trúc microservices, việc đảm bảo giao tiếp chính xác giữa các dịch vụ là yếu tố then chốt.
 
Kiểm thử tích hợp xác minh rằng mỗi service phản hồi đúng và dữ liệu không bị sai lệch giữa các tầng.
6.5. Đánh giá bảo mật hệ thống
6.5.1. Xác thực và phân quyền
Hệ thống áp dụng JSON Web Token cho xác thực người dùng. Mỗi request đều được kiểm tra chữ ký token và vai trò truy cập.
Luồng xác thực được mô hình hóa như sau:
 
Cơ chế này đảm bảo chỉ người dùng hợp lệ mới truy cập được tài nguyên hệ thống.
6.5.2. Cách ly dữ liệu tenant
Mọi truy vấn dữ liệu đều ràng buộc theo TenantId, ngăn chặn truy cập chéo dữ liệu giữa các nhà hàng. Các kịch bản kiểm thử cố tình thay đổi TenantId cho thấy hệ thống từ chối hoặc không trả về dữ liệu trái phép.
Điều này đảm bảo nguyên tắc bảo mật cốt lõi của nền tảng SaaS multi-tenant.
6.5.3. Bảo mật truyền thông
Tất cả giao tiếp client–server được triển khai qua HTTPS nhằm mã hóa dữ liệu truyền tải, ngăn chặn tấn công nghe lén và trung gian (Man-in-the-Middle).
6.6. Đánh giá hiệu năng hệ thống
6.6.1. Kiểm thử tải đơn hàng
Hệ thống được mô phỏng nhiều khách hàng đồng thời quét QR và gửi đơn hàng trong khung thời gian ngắn.
Kết quả cho thấy:
•	Thời gian phản hồi trung bình API đặt món duy trì ở mức thấp
•	Redis giúp giảm tải truy vấn database
•	Real-time update không gây nghẽn hệ thống
6.6.2. Kiểm thử AI Services
Các mô-đun AI được đánh giá theo:
•	Thời gian phản hồi truy vấn chatbot
•	Độ chính xác gợi ý nhà hàng
•	Khả năng mở rộng khi tăng lượng người dùng
Việc tách AI thành microservices độc lập giúp hệ thống dễ dàng scale riêng khi tải tăng cao.
6.7. Độ ổn định và khả năng mở rộng
Nhờ thiết kế stateless cho các service và container hóa bằng Docker, hệ thống có thể:
•	Triển khai nhiều instance cho service tải cao
•	Cân bằng tải qua gateway
•	Tăng tài nguyên linh hoạt theo nhu cầu
Kiến trúc này phù hợp cho môi trường cloud production.
6.8. Đánh giá tổng thể chất lượng hệ thống
Qua quá trình kiểm thử và đo lường, hệ thống S2O đạt được:
•	Độ chính xác nghiệp vụ cao
•	Tính an toàn dữ liệu tốt trong môi trường multi-tenant
•	Hiệu năng ổn định khi xử lý real-time
•	Khả năng mở rộng theo quy mô người dùng
Những yếu tố này chứng minh hệ thống đạt tiêu chuẩn một nền tảng SaaS hiện đại.
CHƯƠNG 7. ĐÁNH GIÁ VÀ SO SÁNH VỚI CÁC HỆ THỐNG HIỆN CÓ
7.1. Mục đích của việc so sánh hệ thống
Trong quá trình phát triển các nền tảng số hóa cho ngành nhà hàng, nhiều giải pháp quản lý và gọi món điện tử đã được triển khai rộng rãi trên thị trường. Việc so sánh hệ thống Scan2Order với các mô hình hiện có nhằm đánh giá mức độ cải tiến về mặt công nghệ, khả năng mở rộng và giá trị mang lại cho doanh nghiệp cũng như người dùng cuối.
So sánh này không chỉ giúp xác định ưu điểm nổi bật của hệ thống S2O mà còn làm rõ những hạn chế còn tồn tại, từ đó định hướng các bước phát triển tiếp theo.
7.2. Nhóm hệ thống gọi món QR truyền thống
Các hệ thống gọi món QR phổ biến hiện nay thường tập trung vào chức năng cơ bản là hiển thị thực đơn và gửi đơn hàng về cho nhà hàng. Phần lớn các giải pháp này được xây dựng như những ứng dụng đơn lẻ dành cho từng nhà hàng riêng biệt.
Về mặt kiến trúc, đa số hệ thống QR menu truyền thống sử dụng mô hình nguyên khối (monolithic) với cơ sở dữ liệu độc lập cho từng nhà hàng. Điều này giúp triển khai đơn giản ban đầu nhưng dẫn đến chi phí vận hành cao khi số lượng nhà hàng tăng lên, đồng thời khó mở rộng tính năng và bảo trì lâu dài.
Ngoài ra, các hệ thống này hiếm khi tích hợp các công cụ phân tích dữ liệu nâng cao hay trí tuệ nhân tạo. Trải nghiệm khách hàng thường dừng lại ở việc gọi món tại bàn, thiếu các chức năng khám phá nhà hàng, đặt bàn trước hay cá nhân hóa dịch vụ.
So với các mô hình này, S2O vượt trội ở khả năng triển khai đa tenant trên cùng một nền tảng, giúp nhiều nhà hàng cùng vận hành hiệu quả với chi phí thấp hơn. Việc tích hợp AI ngay từ kiến trúc nền tảng tạo ra trải nghiệm thông minh và khác biệt so với các giải pháp QR menu truyền thống.
7.3. Nhóm hệ thống quản lý nhà hàng đơn lẻ (POS và ERP nhỏ)
Nhiều nhà hàng hiện nay sử dụng các phần mềm POS (Point of Sale) hoặc hệ thống quản lý nội bộ để theo dõi đơn hàng, kho hàng và doanh thu. Các hệ thống này thường mạnh về quản lý nghiệp vụ nhưng thiếu khả năng tích hợp trực tiếp với trải nghiệm khách hàng qua QR menu hoặc ứng dụng di động.
Về mặt triển khai, phần lớn POS được cài đặt cục bộ tại nhà hàng hoặc trên máy chủ riêng, dẫn đến hạn chế trong việc mở rộng chi nhánh và truy cập dữ liệu từ xa. Việc nâng cấp tính năng thường phức tạp và tốn kém.
S2O khắc phục các hạn chế này bằng mô hình SaaS cloud-based, cho phép quản lý nhiều chi nhánh trên cùng một nền tảng và truy cập dữ liệu mọi lúc mọi nơi. Hơn nữa, hệ thống kết nối trực tiếp quy trình gọi món của khách hàng với dữ liệu vận hành, tạo ra chu trình số hóa khép kín từ trải nghiệm đến quản lý.
7.4. Nhóm nền tảng đặt bàn và khám phá nhà hàng
Một số nền tảng hiện nay tập trung vào việc giúp khách hàng tìm kiếm nhà hàng, đọc đánh giá và đặt bàn trước. Tuy nhiên, các hệ thống này thường chỉ đóng vai trò trung gian kết nối và không tích hợp sâu với quy trình vận hành nội bộ của nhà hàng.
Các dữ liệu về đặt bàn, đánh giá và lịch sử khách hàng thường không được kết nối trực tiếp với hệ thống quản lý đơn hàng hay doanh thu của nhà hàng, dẫn đến sự phân mảnh trong quản lý thông tin.
Ngược lại, S2O kết hợp toàn bộ chuỗi giá trị từ khám phá nhà hàng, đặt bàn, gọi món tại chỗ cho đến thanh toán và đánh giá trong một hệ sinh thái thống nhất. Điều này tạo ra nguồn dữ liệu tập trung có giá trị cao cho việc phân tích hành vi khách hàng và tối ưu vận hành.
7.5. So sánh về mặt kiến trúc công nghệ
Từ góc độ kỹ thuật, nhiều hệ thống hiện có vẫn dựa trên kiến trúc nguyên khối hoặc client-server truyền thống. Việc mở rộng quy mô thường yêu cầu nâng cấp toàn bộ hệ thống, dẫn đến rủi ro cao và chi phí lớn.
S2O được xây dựng trên kiến trúc microservices kết hợp multi-tenant SaaS, cho phép từng thành phần nghiệp vụ mở rộng độc lập theo tải sử dụng. Các mô-đun AI được tách riêng thành dịch vụ độc lập, dễ dàng nâng cấp và tối ưu hiệu năng.
Việc container hóa toàn bộ hệ thống giúp triển khai nhanh trên hạ tầng cloud và hỗ trợ CI/CD, phù hợp với tiêu chuẩn hệ thống hiện đại trong doanh nghiệp.
7.6. So sánh về trải nghiệm người dùng
Ở khía cạnh người dùng cuối, các hệ thống QR menu truyền thống chỉ giải quyết bài toán gọi món nhanh tại bàn. Trong khi đó, S2O mở rộng trải nghiệm thành một hành trình số hóa toàn diện bao gồm:
•	Khám phá nhà hàng trước khi đến
•	Đặt bàn trước trên ứng dụng di động
•	Gọi món QR không cần chờ nhân viên
•	Theo dõi lịch sử ăn uống và chi tiêu
•	Nhận gợi ý thông minh từ AI
Trải nghiệm này giúp tăng sự gắn kết của khách hàng và tạo lợi thế cạnh tranh cho các nhà hàng sử dụng nền tảng.
7.7. Đánh giá giá trị thực tiễn của S2O
Qua so sánh với các hệ thống hiện có, có thể thấy S2O không chỉ đơn thuần là một giải pháp gọi món QR mà là một nền tảng SaaS toàn diện cho ngành F&B. Hệ thống kết hợp vận hành nội bộ, trải nghiệm khách hàng và trí tuệ nhân tạo trong một kiến trúc thống nhất, giúp doanh nghiệp:
•	Giảm chi phí hạ tầng
•	Tối ưu quy trình vận hành
•	Khai thác dữ liệu hiệu quả
•	Nâng cao trải nghiệm khách hàng
Đây là những yếu tố mà phần lớn các giải pháp truyền thống chưa đáp ứng được đầy đủ.
CHƯƠNG 8. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
8.1. Tổng kết kết quả đạt được của đề tài
Trong khuôn khổ đề tài, nhóm thực hiện đã thiết kế và triển khai thành công một nền tảng SaaS quản lý nhà hàng thông minh Scan2Order (S2O) tích hợp gọi món QR, quản lý vận hành đa chi nhánh và các mô-đun trí tuệ nhân tạo hiện đại. Hệ thống không chỉ đáp ứng các yêu cầu nghiệp vụ cốt lõi của ngành F&B mà còn được xây dựng trên kiến trúc kỹ thuật tiên tiến phù hợp với các nền tảng thương mại quy mô lớn.
Từ góc độ phân tích hệ thống, đề tài đã vận dụng đầy đủ các phương pháp mô hình hóa phần mềm như Use Case, Sequence Diagram, ERD và kiến trúc microservices nhằm đảm bảo sự nhất quán giữa yêu cầu nghiệp vụ và triển khai thực tế. Mô hình multi-tenant SaaS được hiện thực hóa thành công, cho phép nhiều nhà hàng vận hành đồng thời trên một hạ tầng thống nhất nhưng vẫn đảm bảo cách ly dữ liệu chặt chẽ.
Ở khía cạnh triển khai, hệ thống đã tích hợp đầy đủ các thành phần quan trọng gồm backend phân tán, frontend web và mobile, cơ sở dữ liệu đa mô hình, cơ chế real-time và các mô-đun trí tuệ nhân tạo dựa trên tìm kiếm ngữ nghĩa. Việc container hóa bằng Docker giúp hệ thống sẵn sàng triển khai trong môi trường cloud, phản ánh đúng quy trình phát triển phần mềm hiện đại.
Kết quả kiểm thử cho thấy hệ thống vận hành ổn định, đáp ứng tốt yêu cầu hiệu năng, bảo mật và khả năng mở rộng, chứng minh tính khả thi của giải pháp trong bối cảnh ứng dụng thực tế.
8.2. Đóng góp khoa học và thực tiễn của đề tài
Về mặt học thuật, đề tài đã:
•	Vận dụng mô hình SaaS multi-tenant vào bài toán quản lý nhà hàng thực tế
•	Triển khai kiến trúc microservices kết hợp real-time communication
•	Ứng dụng trí tuệ nhân tạo vào hệ thống nghiệp vụ thông qua RAG và vector search
Những nội dung này giúp sinh viên tiếp cận các xu hướng công nghệ đang được áp dụng trong các hệ thống doanh nghiệp hiện đại.
Về mặt thực tiễn, nền tảng S2O mang lại giá trị ứng dụng cao cho ngành F&B. Hệ thống giúp nhà hàng số hóa toàn bộ quy trình phục vụ, giảm chi phí vận hành, nâng cao trải nghiệm khách hàng và tạo nền tảng dữ liệu phục vụ phân tích kinh doanh. Mô hình SaaS cho phép triển khai nhanh và mở rộng dễ dàng cho nhiều doanh nghiệp, phù hợp với thị trường nhà hàng có quy mô đa dạng.
8.3. Những hạn chế còn tồn tại
Mặc dù hệ thống đã đạt được nhiều kết quả tích cực, vẫn tồn tại một số hạn chế do phạm vi thời gian và nguồn lực phát triển:
Hệ thống hiện mới tập trung vào các nghiệp vụ cốt lõi và chưa tích hợp đầy đủ các phương thức thanh toán điện tử phổ biến như ví điện tử và ngân hàng số ở mức thương mại hoàn chỉnh.
Các mô-đun AI tuy đã triển khai ở mức nền tảng nhưng vẫn cần được huấn luyện thêm dữ liệu thực tế để cải thiện độ chính xác và khả năng cá nhân hóa gợi ý.
Công cụ giám sát hệ thống (monitoring, logging nâng cao) mới ở mức cơ bản và chưa triển khai đầy đủ các giải pháp quan sát hệ thống chuyên nghiệp như tracing phân tán.
8.4. Định hướng phát triển trong tương lai
Trong các giai đoạn tiếp theo, hệ thống S2O có thể được mở rộng theo nhiều hướng nhằm nâng cao giá trị ứng dụng:
Trước hết, nền tảng có thể tích hợp sâu hơn các giải pháp thanh toán điện tử, hóa đơn điện tử và kết nối trực tiếp với ngân hàng nhằm hoàn thiện chu trình kinh doanh số của nhà hàng.
Tiếp theo, các mô-đun trí tuệ nhân tạo có thể được nâng cấp bằng cách học từ dữ liệu hành vi thực tế của khách hàng để cung cấp gợi ý cá nhân hóa chính xác hơn, dự báo nhu cầu món ăn và tối ưu thực đơn theo mùa.
Hệ thống cũng có thể mở rộng sang các mô hình phân tích kinh doanh nâng cao như dự báo doanh thu, tối ưu nhân sự và quản lý kho thông minh.
Ở cấp độ hạ tầng, việc triển khai các nền tảng cloud-native như Kubernetes sẽ giúp hệ thống đạt khả năng mở rộng tự động và độ sẵn sàng cao hơn trong môi trường production.
Cuối cùng, nền tảng có thể phát triển thành một hệ sinh thái mở, cho phép các bên thứ ba tích hợp dịch vụ như giao đồ ăn, marketing số và phân tích dữ liệu, mở rộng giá trị kinh doanh cho doanh nghiệp nhà hàng.
8.5. Kết luận chung
Đề tài Scan2Order đã xây dựng thành công một nền tảng SaaS quản lý nhà hàng thông minh tích hợp gọi món QR và trí tuệ nhân tạo trên kiến trúc hiện đại. Hệ thống không chỉ đáp ứng các yêu cầu nghiệp vụ của ngành F&B mà còn phản ánh đúng xu hướng phát triển phần mềm doanh nghiệp hiện nay.
Thông qua quá trình phân tích, thiết kế, triển khai và đánh giá, đề tài đã chứng minh khả năng áp dụng các mô hình kiến trúc tiên tiến vào bài toán thực tế, đồng thời tạo ra một sản phẩm có giá trị ứng dụng cao. Đây là nền tảng vững chắc cho việc tiếp tục nghiên cứu, mở rộng và triển khai hệ thống trong môi trường thương mại trong tương lai.
TÀI LIỆU THAM KHẢO (IEEE STYLE)
[1] M. Armbrust et al., “A view of cloud computing,” Communications of the ACM, vol. 53, no. 4, pp. 50–58, 2010.
[2] C. Pahl, “Containerization and the PaaS cloud,” IEEE Cloud Computing, vol. 2, no. 3, pp. 24–31, 2015.
[3] S. Newman, Building Microservices. O’Reilly Media, 2015.
[4] C.-P. Bezemer and A. Zaidman, “Multi-tenant SaaS applications: Maintenance dream or nightmare?” in Proc. Joint ERCIM Workshop on Software Evolution, 2010.
[5] P. Mell and T. Grance, The NIST Definition of Cloud Computing, NIST, 2011.
[6] A. S. Tanenbaum and M. Van Steen, Distributed Systems: Principles and Paradigms. Pearson, 2017.
[7] R. T. Fielding, “Architectural styles and the design of network-based software architectures,” Ph.D. dissertation, Univ. of California, Irvine, 2000.
[8] J. Lewis and M. Fowler, “Microservices: A definition of this new architectural term,” 2014.
[9] Redis Labs, “Redis in real-time data processing,” 2022.
[10] P. Lewis and M. McPartland, “Digital transformation in hospitality industry,” Journal of Tourism Technology, vol. 11, no. 3, pp. 355–370, 2020.
[11] T. Brown et al., “Language models are few-shot learners,” in NeurIPS, 2020.
[12] P. Lewis et al., “Retrieval-augmented generation for knowledge-intensive NLP tasks,” in NeurIPS, 2020.
[13] J. Johnson, M. Douze, and H. Jégou, “Billion-scale similarity search with FAISS,” IEEE Trans. Big Data, 2019.
[14] J. Turnbull, The Docker Book. Turnbull Press, 2014.
[15] Q. Zhang et al., “Restaurant recommendation systems using deep learning,” IEEE Access, vol. 7, 2019.
 
