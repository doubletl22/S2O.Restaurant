using Microsoft.AspNetCore.Http;

namespace S2O.Catalog.App.Abstractions;

public interface IFileService
{
    Task<string> UploadImageAsync(IFormFile file, string folderName = "products");

    Task DeleteFileAsync(string fileUrl);
}