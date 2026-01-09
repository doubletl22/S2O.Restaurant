using Amazon.S3;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Configuration;
using S2O.Shared.Interfaces;

namespace S2O.Shared.Infra.Services;

public class S3StorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3StorageService(IAmazonS3 s3Client, IConfiguration configuration)
    {
        _s3Client = s3Client;
        _bucketName = configuration["S3:BucketName"]!;
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var fileKey = $"{Guid.NewGuid()}-{fileName}";
        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = fileStream,
            Key = fileKey,
            BucketName = _bucketName,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead // Để khách hàng có thể xem ảnh qua URL
        };

        using var transferUtility = new TransferUtility(_s3Client);
        await transferUtility.UploadAsync(uploadRequest);

        return $"https://{_bucketName}.s3.amazonaws.com/{fileKey}";
    }

    public async Task DeleteAsync(string fileUrl)
    {
        var fileKey = fileUrl.Split('/').Last();
        await _s3Client.DeleteObjectAsync(_bucketName, fileKey);
    }
}