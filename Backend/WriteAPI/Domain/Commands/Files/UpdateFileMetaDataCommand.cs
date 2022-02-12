using Common.Attributes;
using Common.DTO;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Commands.Files
{
    public class UpdateFileMetaDataCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [ValidationGuid]
        public Guid FileId { set; get; }

        public int? SecondsDuration { set; get; }
    }
}
