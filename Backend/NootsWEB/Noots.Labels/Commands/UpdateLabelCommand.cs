using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using MediatR;

namespace Noots.Labels.Commands
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
