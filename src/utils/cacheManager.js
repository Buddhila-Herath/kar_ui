import { imageCache } from "./imageCache";

export const CacheManager = {
  
  async clearJobImages(jobDetails) {
    if (!jobDetails) return;

    const imagesToClear = [
      ...(jobDetails.jobCurrentWorkPicturesList || []),
      ...(jobDetails.postCompletionPictures || []),
    ];

    for (const image of imagesToClear) {
      try {
        await imageCache.delete(image.path);
      } catch (error) {
        console.warn(`Failed to clear image ${image.path}:`, error);
      }
    }
  },
  
  async clearVehicleImages(vehicleDetails) {
    if (!vehicleDetails) return;

    const imagesToClear = [
      ...(vehicleDetails.initialRegistrationPhotos || []),
    ];

    for (const image of imagesToClear) {
      try {
        if (image?.path) {
          await imageCache.delete(image.path);
        }
      } catch (error) {
        console.warn(`Failed to clear vehicle image ${image.path}:`, error);
      }
    }
  },
  
  async delete(path) {
    await imageCache.delete(path);
  },

  async getCacheStats() {
    const totalSize = await imageCache.getTotalSize();
    return {
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2) + " MB",
    };
  },

  async clearAllCache() {
    await imageCache.clear();
  },
};