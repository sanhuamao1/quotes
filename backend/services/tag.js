const tagRepository = require("../repositories/tag");
const BusinessError = require("../utils/BusinessError");

class TagService {
    async getTags() {
        try {
            const tags = await Promise.resolve(tagRepository.getAllTags());
            return tags;
        } catch (error) {
            throw new BusinessError("查询标签列表失败", -1, 500);
        }
    }

    async deleteTag(tagId) {
        try {
            const result = await Promise.resolve(tagRepository.deleteTag(tagId));
            return result;
        } catch (error) {
            if (error instanceof BusinessError) {
                throw error;
            }
            throw new BusinessError("删除标签失败", -1, 500);
        }
    }

    async renameTag(tagId, newName) {
        try {
            const result = await Promise.resolve(
                tagRepository.renameTag(tagId, newName),
            );
            return result;
        } catch (error) {
            if (error instanceof BusinessError) {
                throw error;
            }
            throw new BusinessError("重命名标签失败", -1, 500);
        }
    }
}

module.exports = new TagService();
