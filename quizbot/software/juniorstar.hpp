#ifndef JUNIORSTAR_HPP
#define JUNIORSTAR_HPP

#include <cstdint>
#include <json.h>
#include <mutex>
#include <mongoose/mongoose.h>
#include <string>

class juniorstar_client_t
{
	public:
		juniorstar_client_t(const json::Object& json,mg_connection* connection);
		void reply() const;

		json::Object request;
		json::Object response;

	private:
		mg_connection* connection_m;
};

class juniorstar_t
{
	public:
		typedef std::function<bool(juniorstar_client_t)> client_func_t;

		juniorstar_t(client_func_t client_func,const uint16_t port,const std::string webroot="web");
		juniorstar_t(const juniorstar_t& copy)=delete;
		~juniorstar_t();
		juniorstar_t& operator=(const juniorstar_t& copy)=delete;

		bool good() const;
		void start(const bool detach=false);
		void stop();

		uint16_t get_port() const;
		void set_port(const uint16_t port,const bool restart=false);

		std::string get_webroot() const;
		void set_webroot(const std::string& webroot,const bool restart=false);


	private:
		static int client_func_handler(mg_connection* connection,enum mg_event event);
		void server_thread_func_m();
		mg_server* server_m;
		client_func_t client_func_m;
		uint16_t port_m;
		std::string webroot_m;
};

#endif