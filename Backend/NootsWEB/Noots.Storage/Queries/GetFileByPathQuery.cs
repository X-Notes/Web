using Common.CQRS;
using Common.DTO.Files;
using MediatR;

namespace Noots.Storage.Queries
{
    public class GetFileByPathQuery : BaseQueryEntity, IRequest<FilesBytes>
    {
        public string Path { set; get; }

        public string FileName { set; get; }

        public string UserId { set; get; }

        public GetFileByPathQuery(string path, string userId, string fileName)
        {
            Path = path;
            UserId = userId;
            FileName = fileName;
        }
    }
}
