﻿using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;
using System;

namespace Domain.Commands.Users
{
    public class UpdateThemeCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredEnumField(ErrorMessage = "Theme id is required.")]
        public ThemeENUM Id { set; get; }

        public UpdateThemeCommand(ThemeENUM Id, Guid userId)
            : base(userId)
        {
            this.Id = Id;
        }
    }
}
