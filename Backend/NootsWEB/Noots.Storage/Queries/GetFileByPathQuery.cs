using Common.CQRS;
using Common.DatabaseModels.Models.Files.Models;
using Common.DTO.Files;
using MediatR;

namespace Storage.Queries
{
    public class GetFileByPathQuery : BaseQueryEntity, IRequest<FilesBytes>
    {
        public string Path { set; get; }

        public string FileName { set; get; }

        public StoragesEnum StorageId { set; get; }

        public GetFileByPathQuery(StoragesEnum storageId, string path, Guid userId, string fileName)
        {
            Path = path;
            UserId = userId;
            FileName = fileName;
            StorageId = storageId;
        }
    }
}
