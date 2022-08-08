using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;
using System;

namespace Domain.Commands.Users
{
    public class UpdateFontSizeCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredEnumField(ErrorMessage = "Id is required.")]
        public FontSizeENUM Id { set; get; }

        public UpdateFontSizeCommand(FontSizeENUM Id, Guid userId) : base(userId)
        {
            this.Id = Id;
        }
    }
}
