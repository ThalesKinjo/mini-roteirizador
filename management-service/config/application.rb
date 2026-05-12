require_relative "boot"

require "rails"
require "active_record/railtie"
require "action_controller/railtie"
require "action_dispatch/railtie"

Bundler.require(*Rails.groups)

module ManagementService
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true

    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end
  end
end
