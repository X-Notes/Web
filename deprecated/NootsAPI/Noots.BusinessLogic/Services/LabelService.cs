using AutoMapper;
using MongoDB.Bson;
using Noots.DataAccess.Repositories;
using Shared.DTO.Label;
using Shared.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Services
{
    public class LabelService
    {
        private readonly LabelRepository labelRepository;
        private readonly UserRepository userRepository;
        private readonly IMapper mapper;
        public LabelService(LabelRepository labelRepository, UserRepository userRepository, IMapper mapper)
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
        public async Task Update(LabelDTO label)
        {
            var dblabel = mapper.Map<Label>(label);
            if (ObjectId.TryParse(label.Id, out var dbId))
            {
                dblabel.Id = dbId;
                await labelRepository.Update(dblabel);
            }
        }
        public async Task Delete(string id)
        {
            if(ObjectId.TryParse(id, out var dbId))
            {
                await labelRepository.Delete(dbId);
            }
        }
        public async Task<LabelDTO> GetById(string id)
        {
            if(ObjectId.TryParse(id, out var labelId))
            {
                var label =  await labelRepository.GetLabelById(labelId);
                var labelDTO = mapper.Map<LabelDTO>(label);
                return labelDTO;
            }
            throw new Exception();
        }
    }
}
