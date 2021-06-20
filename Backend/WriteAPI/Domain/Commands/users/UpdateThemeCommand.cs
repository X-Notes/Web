using Common.Attributes;
using Common.DatabaseModels.models.Systems;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;


namespace Domain.Commands.users
{
    public class UpdateThemeCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public ThemeENUM Id { set; get; }

        public UpdateThemeCommand(ThemeENUM Id, string Email)
            : base(Email)
        {
            this.Id = Id;
        }
    }
}
