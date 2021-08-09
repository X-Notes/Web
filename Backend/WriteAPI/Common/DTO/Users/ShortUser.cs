using System;
using Common.DatabaseModels.Models.Plan;
using Common.DatabaseModels.Models.Systems;
using Common.DTO.Backgrounds;

namespace Common.DTO.Users
{
    public class ShortUser
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
        public BackgroundDTO CurrentBackground { set; get; }
        public LanguageENUM LanguageId { set; get; }
        public ThemeENUM ThemeId { set; get; }
        public FontSizeENUM FontSizeId { set; get; }
        public BillingPlanTypeENUM BillingPlanId { set; get; }
    }
}
