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
        public FolderTypeDTO FolderType { set; get; }
        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }
    }
}
