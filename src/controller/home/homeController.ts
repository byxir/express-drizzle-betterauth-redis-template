export const getHome = async () => {
  setTimeout(() => {
    return Promise.resolve({ message: "Promise resolved zzzzzz?!" });
  }, 1000);
};
