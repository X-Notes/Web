using MediatR;

namespace Noots.Permissions.Queries
{
    public enum PermissionUploadFileEnum
    {
        CanUpload,
        NoCanUpload
    }

    public class GetPermissionUploadFileQuery : IRequest<PermissionUploadFileEnum>
    {
        public Guid UserId { set; get; }
        public long FileSize { set; get; }

        public GetPermissionUploadFileQuery(long fileSize, Guid userId)
        {
            FileSize = fileSize;
            UserId = userId;
        }
    }
}
