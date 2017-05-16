/* ============
 * {{ name }} Module State
 * ============
 *
 * todo: add documentation here!
 */

// When the request fails
const success = (response) => {
};

// When the request fails
const failed = () => {
};

export default () => {
  Vue.$http.get('/account')
    .then((response) => {
      success(response);
    })
    .catch((error) => {
      failed(error);
    });
};
