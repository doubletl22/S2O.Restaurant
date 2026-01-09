namespace S2O.Shared.Interfaces;

public interface IFileStorageService
{
    // Trả về URL của file sau khi upload
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task DeleteAsync(string fileUrl);
}