#nullable enable
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Labels.Commands
{
    public class UpdateLabelCommand : BaseCommandEntity, IRequest<Unit>
    {
        [ValidationGuid]
        public Guid Id { set; get; }

        [MaxLength(500)]
        public string? Name { set; get; }

        [Required]
        public string Color { set; get; }

        public UpdateLabelCommand(Guid userId)
            :base(userId)
        {

        }
    }
}