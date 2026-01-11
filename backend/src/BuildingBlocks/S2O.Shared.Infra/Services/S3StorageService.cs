using Amazon.S3;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Configuration;
using S2O.Shared.Kernel.Interfaces;

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

    // File: backend/src/BuildingBlocks/S2O.Shared.Infra/Services/S3StorageService.cs

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var fileKey = $"{Guid.NewGuid()}-{fileName}";
        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = fileStream,
            Key = fileKey,
            BucketName = _bucketName,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };

        using var transferUtility = new TransferUtility(_s3Client);
        await transferUtility.UploadAsync(uploadRequest);

        // KIỂM TRA: Nếu có ServiceURL trong config (đang chạy MinIO/LocalStack)
        if (!string.IsNullOrEmpty(_s3Client.Config.ServiceURL))
        {
            // Trả về link local: http://localhost:9000/s2o-catalog/tên-file
            return $"{_s3Client.Config.ServiceURL}/{_bucketName}/{fileKey}";
        }

        // Ngược lại trả về link AWS S3 chuẩn
        return $"https://{_bucketName}.s3.amazonaws.com/{fileKey}";
    }

    public async Task DeleteAsync(string fileUrl)
    {
        var fileKey = fileUrl.Split('/').Last();
        await _s3Client.DeleteObjectAsync(_bucketName, fileKey);
    }
}