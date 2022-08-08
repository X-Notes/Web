using System;
using Common.DTO.Files;
using MediatR;

namespace Domain.Queries.Files
{
    public class GetFileByPathQuery : BaseQueryEntity, IRequest<FilesBytes>
    {
        public string Path { set; get; }

        public string FileName { set; get; }

        public string UserId { set; get; }

        public GetFileByPathQuery(string path, string userId, string fileName)
        {
            this.Path = path;
            UserId = userId;
            this.FileName = fileName;
        }
    }
}
