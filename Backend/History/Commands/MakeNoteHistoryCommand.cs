using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using MediatR;

namespace History.Commands
{
    public class MakeNoteHistoryCommand : IRequest<Unit>
    {
        [Required]
        public Guid Id { set; get; }

        [RequiredListNotEmpty]
        public List<Guid> UserIds { set; get; }

        public MakeNoteHistoryCommand(Guid id, HashSet<Guid> userIds)
        {
            Id = id;
            UserIds = userIds?.ToList();
        }
    }
}
