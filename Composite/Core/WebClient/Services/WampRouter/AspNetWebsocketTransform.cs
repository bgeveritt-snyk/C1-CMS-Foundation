using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.WebSockets;
using WampSharp.Core.Listener;
using WampSharp.V2.Authentication;
using WampSharp.V2.Binding;
using WampSharp.V2.Transports;
using WampSharp.WebSockets;

namespace Composite.Core.WebClient.Services.WampRouter
{
    /// <exclude />
    public sealed class AspNetWebsocketTransform : WebSocketTransport<WebSocketData>
    {
        private static AspNetWebsocketTransform _aspNetWebsocketTransformInstance;

        /// <exclude />
        public AspNetWebsocketTransform(ICookieAuthenticatorFactory authenticatorFactory = null) : base(authenticatorFactory)
        {
            _aspNetWebsocketTransformInstance = this;
        }

        /// <exclude />
        public override void Dispose()
        {
            _aspNetWebsocketTransformInstance = null;
        }

        /// <exclude />
        protected override void OpenConnection<TMessage>(WebSocketData original, IWampConnection<TMessage> connection)
        {
            WebSocketConnection<TMessage> casted = connection as WebSocketConnection<TMessage>;

            Task task = Task.Run(casted.RunAsync);

            original.ReadTask = task;
        }

        /// <exclude />
        protected override string GetSubProtocol(WebSocketData connection)
        {
            return connection.WebSocket.SubProtocol;
        }

        /// <exclude />
        protected override IWampConnection<TMessage> CreateBinaryConnection<TMessage>(WebSocketData connection, IWampBinaryBinding<TMessage> binding)
        {
            return new BinaryWebSocketConnection<TMessage>(connection.WebSocket,
                binding,
                new AspNetCookieProvider(connection.HttpContext),
                AuthenticatorFactory);
        }

        /// <exclude />
        protected override IWampConnection<TMessage> CreateTextConnection<TMessage>(WebSocketData connection, IWampTextBinding<TMessage> binding)
        {
            return new TextWebSocketConnection<TMessage>(connection.WebSocket,
                binding,
                new AspNetCookieProvider(connection.HttpContext),
                AuthenticatorFactory);
        }

        /// <exclude />
        public override void Open()
        {
        }

        /// <exclude />
        public async Task NewConnection(WebSocketData data)
        {
            OnNewConnection(data);
            await data.ReadTask.ConfigureAwait(false);
        }

        /// <exclude />
        [RoutePrefix("Composite2/api/Router")]
        public class RouterController : ApiController
        {
            /// <exclude />
            [Route("")]
            public HttpResponseMessage Get()
            {
                if (HttpContext.Current.IsWebSocketRequest)
                {
                    IEnumerable<string> possibleSubProtocols =
                        HttpContext.Current.WebSocketRequestedProtocols
                            .Intersect(_aspNetWebsocketTransformInstance.SubProtocols);

                    string subprotocol =
                        possibleSubProtocols.FirstOrDefault();

                    if (subprotocol != null)
                    {
                        HttpContext.Current.AcceptWebSocketRequest(async (webSocketContext) =>
                        {
                            var webSocketData = new WebSocketData(webSocketContext.WebSocket, HttpContext.Current);
                            await _aspNetWebsocketTransformInstance.NewConnection(webSocketData);
                        },
                            new AspNetWebSocketOptions()
                            {
                                SubProtocol = HttpContext.Current.WebSocketRequestedProtocols.FirstOrDefault()
                            });
                    }
                    return Request.CreateResponse(HttpStatusCode.SwitchingProtocols);
                }
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }
    }
}