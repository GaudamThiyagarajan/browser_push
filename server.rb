#Use WebPush Gem 
data = {
				:title => object.title, 
				:description => object.description,
				:big_image => object.big_image,
				:notifiable_type => object.notifiable[:type],
				:notifiable_id => object.notifiable[:id],
				:url => object.url,
				:notification_id => notification_id,
				:user_id => user_id,
				:domain => ''
			}

data[:user_id] = user_id if user_id.present?
		  		public_key = APP_CONFIG['webpush_public_key']
		  		private_key = APP_CONFIG['webpush_private_key']
				 Webpush.payload_send(
					endpoint: registration_token["endpoint"],
					message: JSON.generate(data),
					p256dh: registration_token["keys"]["p256dh"],
					auth: registration_token["keys"]["auth"],
						vapid: {
								public_key: public_key,
								private_key: private_key
				})