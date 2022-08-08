using System;
using Common.DTO.Permissions;
using MediatR;

namespace Domain.Queries.Permissions
{
    public class GetUserPermissionsForNoteQuery : BaseQueryEntity, IRequest<UserPermissionsForNote>
    { 
        public Guid NoteId { set; get; }

        public GetUserPermissionsForNoteQuery(Guid noteId, Guid userId)
        {
            this.NoteId = noteId;
            this.UserId = userId;
        }
    }
}
