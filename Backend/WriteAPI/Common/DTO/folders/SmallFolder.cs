using Common.DTO.app;
using System;

namespace Common.DTO.folders
{
    public class SmallFolder
    {
        public Guid Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public RefTypeDTO RefType { set; get; }
    }
}
