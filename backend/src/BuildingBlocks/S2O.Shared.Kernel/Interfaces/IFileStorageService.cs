namespace S2O.Shared.Kernel.Interfaces;

public interface IFileStorageService
{
    // Trả về URL của file sau khi upload thành công
    Task<string> UploadFileAsync(Stream stream, string fileName);

    // (Tùy chọn) Thêm hàm xóa file nếu cần sau này
    Task DeleteFileAsync(string publicId);
}