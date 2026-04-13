using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Shared.Infra.Services;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;
    private readonly string _uploadsDirectory;
    private readonly string _publicBaseUrl;

    public CloudinaryStorageService(Cloudinary cloudinary, IWebHostEnvironment environment, IConfiguration configuration)
    {
        _cloudinary = cloudinary ?? throw new ArgumentNullException(nameof(cloudinary));

        var uploadsRoot = Path.Combine(Path.GetTempPath(), "s2o-uploads", "products");
        _uploadsDirectory = uploadsRoot;
        Directory.CreateDirectory(_uploadsDirectory);

        _publicBaseUrl =
            configuration["FileStorage:PublicBaseUrl"] ??
            configuration["PublicBaseUrl"] ??
            "http://localhost:5002";
    }

    public async Task<string> UploadFileAsync(Stream stream, string fileName)
    {
        if (stream == null) throw new ArgumentNullException(nameof(stream));
        if (string.IsNullOrWhiteSpace(fileName)) throw new ArgumentException("File name is required.", nameof(fileName));

        byte[] fileBytes;
        using (var bufferedStream = new MemoryStream())
        {
            await stream.CopyToAsync(bufferedStream);
            fileBytes = bufferedStream.ToArray();
        }

        try
        {
            using var cloudStream = new MemoryStream(fileBytes);
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(fileName, cloudStream),
                Folder = "s2o_restaurant/products",
                PublicId = Guid.NewGuid().ToString()
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            if (result?.SecureUrl != null)
            {
                return result.SecureUrl.ToString();
            }
        }
        catch
        {
            // Fall back to local file storage when external upload fails.
        }

        var extension = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = ".jpg";
        }

        var generatedFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var physicalPath = Path.Combine(_uploadsDirectory, generatedFileName);

        await using (var fileStream = File.Create(physicalPath))
        await using (var localStream = new MemoryStream(fileBytes))
        {
            await localStream.CopyToAsync(fileStream);
        }

        return $"{_publicBaseUrl.TrimEnd('/')}/uploads/products/{generatedFileName}";
    }

    public async Task DeleteFileAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }
}