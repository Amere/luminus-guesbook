(ns guestbook.routes.services
  (:require
   [reitit.swagger :as swagger]
   [reitit.swagger-ui :as swagger-ui]
   [reitit.ring.coercion :as coercion]
   [reitit.coercion.spec :as spec-coercion]
   [reitit.ring.middleware.muuntaja :as muuntaja]
   [reitit.ring.middleware.exception :as exception]
   [reitit.ring.middleware.multipart :as multipart]
   [reitit.ring.middleware.parameters :as parameters]
   [guestbook.messages :as msg]
   [guestbook.middleware :as middleware]
   [ring.util.http-response :as response]
   [guestbook.middleware.formats :as formats]
   [guestbook.auth :as auth]
   [spec-tools.data-spec :as ds]
   [guestbook.auth-z.ring :refer [wrap-authorized get-roles-from-match]]
   [clojure.tools.logging :as log]
   [guestbook.auth-z :as auth-z]
   [guestbook.author :as author]))

(defn service-routes []
  ["/api"
   {:middleware [;; query-params & form-params
                 parameters/parameters-middleware
                 ;; content-negotiation
                 muuntaja/format-negotiate-middleware
                 ;; encoding response body
                 muuntaja/format-response-middleware
                 ;; exception handling
                 exception/exception-middleware
                 ;; decoding request body
                 muuntaja/format-request-middleware
                 ;; coercing response bodys
                 coercion/coerce-response-middleware
                 ;; coercing request parameters
                 coercion/coerce-request-middleware
                 ;; multipart params
                 multipart/multipart-middleware
                 ;; authorization handling
                 (fn [handler]
                   (wrap-authorized
                    handler
                    (fn handle-unauthorized [req]
                      (let [route-roles (get-roles-from-match req)]
                        (log/debug
                         "Roles for route: "
                         (:uri req)
                         route-roles)
                        (log/debug "User is unauthorized!"
                                   (-> req
                                       :session
                                       :identity
                                       :roles))
                        (response/forbidden
                         {:message
                          (str "User must have one of the following roles: "
                               route-roles)})))))]
    :muuntaja   formats/instance
    :coercion   spec-coercion/coercion
    :swagger    {:id ::api}}
   ["" {:no-doc      true
        ::auth-z/roles (auth-z/roles :swagger/swagger)}
    ["/swagger.json"
     {:get (swagger/create-swagger-handler)}]
    ["/swagger-ui*"
     {:get (swagger-ui/create-swagger-ui-handler {:url "/api/swagger.json"})}]]
   ["/session"
    {::auth-z/roles (auth-z/roles :session/get)
     :get
     {:responses
      {200
       {:body
        {:session
         {:identity
          (ds/maybe
           {:login      string?
            :created_at inst?})}}}}
      :handler
      (fn [{{:keys [identity]} :session}]
        (response/ok {:session
                      {:identity
                       (not-empty
                        (select-keys identity [:login :created_at]))}}))}}]
   ["/login"
    {::auth-z/roles (auth-z/roles :auth/login)
     :post
     {:parameters
      {:body
       {:login    string?
        :password string?}}
      :responses
      {200
       {:body
        {:identity
         {:login      string?
          :created_at inst?}}}
       401
       {:body
        {:message string?}}}
      :handler
      (fn [{{{:keys [login password]} :body} :parameters
            session                          :session}]
        (if-some [user (auth/authenticate-user login password)]
          (->
           (response/ok
            {:identity user})
           (assoc :session (assoc session
                                  :identity
                                  user)))
          (response/unauthorized
           {:message "Incorrect login or password"})))}}]
   ["/register"
    {::auth-z/roles (auth-z/roles :account/register)
     :post          {:parameters
                     {:body
                      {:login    string?
                       :password string?
                       :confirm  string?}}
                     :responses
                     {200
                      {:body
                       {:message string?}}
                      400
                      {:body
                       {:message string?}}
                      409
                      {:body
                       {:message string?}}}
                     :handler
                     (fn [{{{:keys [login password confirm]} :body} :parameters}]
                       (if-not (= password confirm)
                         (response/bad-request
                          {:message
                           "Password and Confirm do not match."})
                         (try
                           (auth/create-user! login password)
                           (response/ok
                            {:message
                             "User registration successful. Please log in."})
                           (catch clojure.lang.ExceptionInfo e
                             (if (= (:guestbook/error-id (ex-data e))
                                    ::auth/duplicate-user)
                               (response/conflict
                                {:message
                                 "Registration failed! User with login already exists!"})
                               (throw e))))))}}]
   ["/logout"
    {::auth-z/roles (auth-z/roles :auth/logout)
     :post          {:handler
                     (fn [_]
                       (->
                        (response/ok)
                        (assoc :session nil)))}}]
   ["/author/:login"
    {::auth-z/roles (auth-z/roles :author/get)
     :get {:parameters
           {:path {:login string?}}
           :responses
           {200
            {:body map?}
            500
            {:errors map?}}
           :handler
           (fn [{{{:keys [login]} :path} :parameters}]
             (response/ok (author/get-author login)))}}]
   ["/my-account"
    ["/set-profile"
     {::auth-z/roles (auth-z/roles :account/set-profile!)
      :post {:parameters
             {:body
              {:profile map?}}
             :responses
             {200
              {:body map?}
              500
              {:errors map?}}
             :handler
             (fn [{{{:keys [profile]} :body} :parameters
                   {:keys [identity] :as session} :session}]
               (try
                 (let [identity
                       (author/set-author-profile (:login identity) profile)]
                   (update (response/ok {:success true})
                           :session
                           assoc :identity identity))
                 (catch Exception e
                   (log/error e)
                   (response/internal-server-error
                    {:errors {:server-error
                              ["Failed to set profile!"]}}))))}}]]
   ["/messages"
    {::auth-z/roles (auth-z/roles :messages/list)}
    ["" {:get
         {:responses
          {200
           {:body ;; Data Spec for response body
            {:messages
             [{:id        pos-int?
               :name      string?
               :message   string?
               :timestamp inst?}]}}}
          :handler
          (fn [_]
            (response/ok (msg/message-list)))}}]
    ["/by/:author"
     {:get
      {:parameters {:path {:author string?}}
       :responses
       {200
        {:body ;; Data Spec for response body
         {:messages
          [{:id        pos-int?
            :name      string?
            :message   string?
            :timestamp inst?}]}}}
       :handler
       (fn [{{{:keys [author]} :path} :parameters}]
         (response/ok (msg/messages-by-author author)))}}]]
   ["/message"
    {::auth-z/roles (auth-z/roles :message/create!)
     :post
     {:parameters
      {:body ;; Data Spec for Request body parameters
       {:name    string?
        :message string?}}
      :responses
      {200
       {:body map?}
       400
       {:body map?}
       500
       {:errors map?}}
      :handler
      (fn [{{params :body}     :parameters
            {:keys [identity]} :session}]
        (try
          (->> (msg/save-message! identity params)
               (assoc {:satus :ok} :post)
               (response/ok))
          (catch Exception e
            (let [{id     :guestbook/error-id
                   errors :errors} (ex-data e)]
              (case id
                :validation
                (response/bad-request {:errors errors})
                ;;else
                (response/internal-server-error
                 {:errors
                  {:server-error ["Failed to save message!"]}}))))))}}]])
