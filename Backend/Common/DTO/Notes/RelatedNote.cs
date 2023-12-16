namespace Common.DTO.Notes
{
    public class RelatedNote : SmallNote
    {
        public int RelationId { set; get; }

        public bool IsOpened { set; get; }
    }
}
