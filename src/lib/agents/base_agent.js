/**
 * Base Agent class defining the standard interface for all agents.
 */
class BaseAgent {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }

  /**
   * Main execution method for the agent.
   * @param {Object} context - The current context (user state, challenge state, etc.)
   * @returns {Promise<Object>} - The result of the agent's action.
   */
  async execute(context) {
    throw new Error("Method 'execute' must be implemented.");
  }

  log(message) {
    console.log(`[${this.name}] ${message}`);
  }
}

export default BaseAgent;
