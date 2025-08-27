-- Insert sample destinations
INSERT INTO destinations (
    name, description, long_description, location, price, duration, group_size, best_time, rating, review_count,
    image_url, gallery_images, activities, highlights, included, not_included
) VALUES 
(
    'Vịnh Hạ Long',
    'Di sản thế giới với hàng nghìn đảo đá vôi tuyệt đẹp',
    'Vịnh Hạ Long là một trong những kỳ quan thiên nhiên nổi tiếng nhất của Việt Nam, được UNESCO công nhận là Di sản Thiên nhiên Thế giới. Với hơn 1.600 hòn đảo đá vôi nhô lên từ mặt nước màu ngọc lục bảo, tạo nên một khung cảnh huyền ảo và thơ mộng.',
    'Quảng Ninh, Việt Nam',
    1200000,
    '2 ngày 1 đêm',
    '10-15 người',
    'Tháng 10 - Tháng 4',
    4.8,
    2847,
    '/ha-long-bay-vietnam-limestone-islands-emerald-wate.png',
    ARRAY['/ha-long-bay-vietnam-limestone-islands-emerald-wate.png', '/ha-long-bay-sunset-cruise-boats.png', '/ha-long-bay-cave-interior-stalactites.png'],
    '[
        {"name": "Du thuyền ngắm cảnh", "description": "Khám phá vịnh trên du thuyền sang trọng", "icon": "Waves"},
        {"name": "Thăm hang động", "description": "Khám phá hang Sửng Sốt, hang Đầu Gỗ", "icon": "Mountain"},
        {"name": "Chụp ảnh", "description": "Ghi lại những khoảnh khắc đẹp nhất", "icon": "Camera"},
        {"name": "Đảo Ti Tốp", "description": "Leo núi ngắm toàn cảnh vịnh", "icon": "TreePine"}
    ]'::jsonb,
    ARRAY['Du thuyền qua đêm trên vịnh', 'Thăm làng chài Cửa Vạn', 'Kayak khám phá hang động', 'Thưởng thức hải sản tươi sống', 'Ngắm hoàng hôn trên vịnh'],
    ARRAY['Xe đưa đón từ Hà Nội', 'Du thuyền 2 ngày 1 đêm', 'Các bữa ăn theo chương trình', 'Hướng dẫn viên tiếng Việt', 'Vé tham quan các điểm'],
    ARRAY['Chi phí cá nhân', 'Đồ uống có cồn', 'Bảo hiểm du lịch', 'Tip cho hướng dẫn viên']
),
(
    'Hội An',
    'Phố cổ với kiến trúc độc đáo và đèn lồng rực rỡ',
    'Hội An là một thành phố cổ kính nằm bên bờ sông Thu Bồn, nổi tiếng với kiến trúc cổ được bảo tồn nguyên vẹn, những chiếc đèn lồng đầy màu sắc và nền ẩm thực phong phú. Phố cổ Hội An đã được UNESCO công nhận là Di sản Văn hóa Thế giới.',
    'Quảng Nam, Việt Nam',
    800000,
    '1 ngày',
    '8-12 người',
    'Tháng 2 - Tháng 8',
    4.9,
    3521,
    '/hoi-an-ancient-town-lanterns-yellow-buildings.png',
    ARRAY['/hoi-an-ancient-town-lanterns-yellow-buildings.png', '/hoi-an-japanese-bridge-night.png', '/hoi-an-tailor-shops-silk-lanterns.png'],
    '[
        {"name": "Tham quan phố cổ", "description": "Khám phá kiến trúc cổ kính", "icon": "Camera"},
        {"name": "Thả đèn hoa đăng", "description": "Cầu nguyện trên sông Thu Bồn", "icon": "Waves"},
        {"name": "Làng rau Trà Quế", "description": "Trải nghiệm làm nông", "icon": "TreePine"},
        {"name": "Thánh địa Mỹ Sơn", "description": "Khám phá văn hóa Chăm", "icon": "Mountain"}
    ]'::jsonb,
    ARRAY['Chùa Cầu Nhật Bản', 'Nhà cổ Tấn Ký', 'Phố đèn lồng về đêm', 'Ẩm thực đường phố', 'Làng nghề truyền thống'],
    ARRAY['Xe đưa đón trong thành phố', 'Vé tham quan các điểm', 'Bữa trưa đặc sản địa phương', 'Hướng dẫn viên địa phương', 'Nước uống trong tour'],
    ARRAY['Chi phí cá nhân', 'Mua sắm quà lưu niệm', 'Bảo hiểm du lịch', 'Các bữa ăn khác']
),
(
    'Sapa',
    'Ruộng bậc thang và văn hóa dân tộc thiểu số',
    'Sapa là một thị trấn miền núi nổi tiếng với những ruộng bậc thang tuyệt đẹp, khí hậu mát mẻ quanh năm và văn hóa đa dạng của các dân tộc thiểu số. Đây là điểm đến lý tưởng cho những ai yêu thích trekking và khám phá thiên nhiên.',
    'Lào Cai, Việt Nam',
    1500000,
    '3 ngày 2 đêm',
    '8-12 người',
    'Tháng 9 - Tháng 11, Tháng 3 - Tháng 5',
    4.7,
    1892,
    '/sapa-terraced-rice-fields-mountains-vietnam.png',
    ARRAY['/sapa-terraced-rice-fields-mountains-vietnam.png'],
    '[
        {"name": "Trekking ruộng bậc thang", "description": "Khám phá cảnh quan thiên nhiên", "icon": "Mountain"},
        {"name": "Thăm bản làng", "description": "Tìm hiểu văn hóa dân tộc", "icon": "TreePine"},
        {"name": "Chợ phiên Sapa", "description": "Mua sắm đặc sản địa phương", "icon": "Camera"},
        {"name": "Fansipan", "description": "Chinh phục nóc nhà Đông Dương", "icon": "Mountain"}
    ]'::jsonb,
    ARRAY['Ruộng bậc thang Mường Hoa', 'Bản Cát Cát', 'Thác Bạc', 'Đỉnh Fansipan', 'Chợ tình Sapa'],
    ARRAY['Xe đưa đón từ Hà Nội', 'Khách sạn 3 sao', 'Các bữa ăn theo chương trình', 'Hướng dẫn viên địa phương', 'Vé tham quan'],
    ARRAY['Chi phí cá nhân', 'Cáp treo Fansipan', 'Bảo hiểm du lịch', 'Đồ uống có cồn']
),
(
    'Phú Quốc',
    'Đảo ngọc với bãi biển trắng và nước biển trong xanh',
    'Phú Quốc được mệnh danh là "đảo ngọc" của Việt Nam với những bãi biển cát trắng mịn màng, nước biển trong xanh như ngọc bích và hệ sinh thái biển phong phú. Đây là điểm đến lý tưởng cho kỳ nghỉ dưỡng và các hoạt động thể thao biển.',
    'Kiên Giang, Việt Nam',
    2000000,
    '3 ngày 2 đêm',
    '10-15 người',
    'Tháng 11 - Tháng 4',
    4.6,
    2156,
    '/phu-quoc-island-white-sand-beach-crystal-clear-wat.png',
    ARRAY['/phu-quoc-island-white-sand-beach-crystal-clear-wat.png'],
    '[
        {"name": "Tắm biển", "description": "Thư giãn trên bãi biển đẹp", "icon": "Waves"},
        {"name": "Lặn ngắm san hô", "description": "Khám phá thế giới dưới nước", "icon": "Camera"},
        {"name": "Câu cá", "description": "Trải nghiệm câu cá trên biển", "icon": "TreePine"},
        {"name": "Cáp treo Hòn Thơm", "description": "Ngắm cảnh từ trên cao", "icon": "Mountain"}
    ]'::jsonb,
    ARRAY['Bãi Sao', 'Cáp treo Hòn Thơm', 'Chợ đêm Dinh Cậu', 'Làng chài Hàm Ninh', 'Vinpearl Safari'],
    ARRAY['Vé máy bay khứ hồi', 'Khách sạn resort 4 sao', 'Các bữa ăn theo chương trình', 'Xe đưa đón sân bay', 'Tour tham quan'],
    ARRAY['Chi phí cá nhân', 'Hoạt động thể thao biển', 'Bảo hiểm du lịch', 'Spa và massage']
);
