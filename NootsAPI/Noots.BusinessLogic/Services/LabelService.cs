using AutoMapper;
using Noots.BusinessLogic.Interfaces;
using Noots.DataAccess.InterfacesRepositories;
using Shared.DTO.Label;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class LabelService : ILabelService
    {
        private readonly ILabelRepository labelRepository;
        private readonly IUserRepository userRepository;
        private readonly IMapper mapper;
        public LabelService(ILabelRepository labelRepository, IUserRepository userRepository, IMapper mapper)
        {
            this.labelRepository = labelRepository;
            this.userRepository = userRepository;
            this.mapper = mapper;
        }
        public async Task<string> Add(NewLabel newLabel,string email)
        {
            var user = await this.userRepository.GetByEmail(email);

            var dbLabel = mapper.Map<Label>(newLabel);
            dbLabel.UserId = user.Id;

            var _id = await labelRepository.Add(dbLabel);
            return _id.ToString();
        }
        public async Task<List<LabelDTO>> GetLabelsByUserId(string email)
        {
            var user = await this.userRepository.GetByEmail(email);

            var labels = await labelRepository.GetLabelsByUserId(user.Id);
            var labelsDTO = mapper.Map<List<LabelDTO>>(labels);

            return labelsDTO;
        }
    }
}
