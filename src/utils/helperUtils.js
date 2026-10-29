export const formatCount = (count) => {
    return count < 10 ? `0${count}` : count;
};