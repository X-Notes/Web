using Common.DTO.permissions;
using MediatR;
using System;

namespace Domain.Queries.permissions
{
    public class GetUserPermissionsForNote : BaseQueryEntity, IRequest<UserPermissionsForNote>
    { 
        public Guid NoteId { set; get; }

        public GetUserPermissionsForNote(Guid NoteId, string Email)
        {
            this.NoteId = NoteId;
            this.Email = Email;
        }
    }
}
