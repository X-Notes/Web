using System;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Labels
{
    public class UpdateLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        public string Name { set; get; }

        [Required]
        public string Color { set; get; }

        public UpdateLabelCommand(Guid userId)
            :base(userId)
        {

        }
    }
}
