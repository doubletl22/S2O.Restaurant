using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Npgsql.BackendMessages;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Shared.Infra.Services;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService(Cloudinary cloudinary) => _cloudinary = cloudinary;

    public async Task<string> UploadFileAsync(Stream stream, string fileName)
    {
        var uploadParams = new ImageUploadParams()
        {
            File = new FileDescription(fileName, stream),
            Folder = "s2o_restaurant/products",
            PublicId = Guid.NewGuid().ToString()
        };
        var result = await _cloudinary.UploadAsync(uploadParams);
        return result.SecureUrl.ToString();
    }

    public async Task DeleteFileAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }
}