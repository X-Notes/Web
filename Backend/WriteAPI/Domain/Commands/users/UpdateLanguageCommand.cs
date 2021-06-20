using Common.Attributes;
using Common.DatabaseModels.models.Systems;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Commands.users
{
    public class UpdateLanguageCommand : BaseCommandEntity, IRequest<Unit>
    {
        [Required]
        public LanguageENUM Id { set; get; }

        public UpdateLanguageCommand(LanguageENUM Id, string Email)
            :base(Email)
        {
            this.Id = Id;
        }
    }
}
