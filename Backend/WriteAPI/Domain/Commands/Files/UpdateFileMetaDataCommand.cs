using Common.Attributes;
using Common.DTO;
using Common.DTO.Files;
using MediatR;
using System;


namespace Domain.Commands.Files
{
    public class UpdateFileMetaDataCommand : BaseCommandEntity, IRequest<OperationResult<FileDTO>>
    {
        [ValidationGuid]
        public Guid FileId { set; get; }

        public int SecondsDuration { set; get; }

        public Guid? ImageFileId { set; get; }
    }
}
