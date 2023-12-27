using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using MediatR;

namespace Editor.Commands.Title
{
    public class UpdateTitleNoteCommand : BaseCommandEntity, IRequest<OperationResult<VersionUpdateResult>>
    {
        [MaxLength(500)]
        public string Title { set; get; }

        [ValidationGuid]
        public Guid Id { set; get; }

        public string ConnectionId { set; get; }
    }
}