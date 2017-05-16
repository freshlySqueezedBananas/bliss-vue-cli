/* ============
 * {{ name }} Module
 * ============
 *
 * todo: add documentation here!
 */

const success = (response) => {
};

const failed = () => {
};

export default () => {
  Vue.$http.get('/')
    .then((response) => {
      success(response);
    })
    .catch((error) => {
      failed(error);
    });
};
