using Common.Attributes;
using Common.DatabaseModels.models;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.share.folders
{
    public class ChangeRefTypeFolders : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuidAttribute]
        public Guid Id { get; set; }

        [ValidationGuidAttribute]
        public Guid RefTypeId { set; get; }
    }
}
