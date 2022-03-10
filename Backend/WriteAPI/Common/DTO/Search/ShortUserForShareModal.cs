﻿using System;

namespace Common.DTO.Search
{
    public class ShortUserForShareModal
    {
        public Guid Id { set; get; }

        public string Name { set; get; }

        public string Email { set; get; }

        public Guid PhotoId { set; get; }

        public string PhotoPath { set; get; }

        public string DefaultPhotoURL { set; get; }
    }
}
