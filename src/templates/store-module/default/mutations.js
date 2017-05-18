/* ============
 * Mutations for {{ name }} module
 * ============
 *
 * The mutations that are available on the
 * {{ name }} module.
 */

import { 
  STORE
 } from './mutation-types';

export default {
  [STORE] (state, account) {
    state.email = account.email;
    state.firstName = account.firstName;
    state.lastName = account.lastName;
  }
};
