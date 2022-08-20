using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Files;
using MediatR;


namespace Noots.Storage.Commands
{
    public class UpdateFileMetaDataCommand : BaseCommandEntity, IRequest<OperationResult<FileDTO>>
    {
        [ValidationGuid]
        public Guid FileId { set; get; }

        public int SecondsDuration { set; get; }

        public Guid? ImageFileId { set; get; }
    }
}
