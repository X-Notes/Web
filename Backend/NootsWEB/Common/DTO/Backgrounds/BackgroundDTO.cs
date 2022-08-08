using System;

namespace Common.DTO.Backgrounds
{
    public class BackgroundDTO
    {
        public Guid Id { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
    }
}
