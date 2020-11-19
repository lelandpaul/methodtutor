<script>
  import { post } from './ajax.js';


  var email;
  var password;
  var remember = false;
  var flash = '';

  async function submit() {
    var resp = await post('login', {
      email: email,
      password: password,
      remember: remember,
    });
    if (resp.success) {
      window.location.href="/";
    } else {
      email = '';
      password = '';
      flash = 'Email or password is incorrect.';
      console.log('bad login')
    }
  }

</script>

<style>

  .card {
    width: 400px;
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translateX(-50%);
  }


  strong {
    color: red;
  }


</style>

<div class="card">

  <div class="card-body">

    <div class="card-title text-center">
      <h3>
        Method Tutor
      </h3>
    </div>

    <div class="card-text">

    {#if flash}
      <strong>{flash}</strong>
    {/if}


      <form>

        <div class="form-group">

          <label for="emailInput">Email address</label>

          <input type="email" class="form-control" id="emailInput"
                  bind:value={email}>

        </div>

        <div class="form-group">

          <label for="passwordInput">Password</label>

          <input type="password" class="form-control" id="passwordInput"
                  bind:value={password}>

        </div>

        <div class="form-group form-check d-inline-block mb-0 mt-2">
          <input type="checkbox" class="form-check-input" id="rememberCheck"
                 bind:checked={remember}/>
          <label class="form-check-label" for="rememberCheck">Keep me logged in</label>
        </div>


        <button type="submit" class="btn btn-primary float-right"
                on:click|preventDefault={submit}>Log In</button>

      </form>

      <p class="text-muted mb-0 mt-4">
        Log in with your <a href="https://ringingroom.com">Ringing Room</a> account.
      </p>

      <p class="text-muted mb-1">
        Don't have one? Click <a href="https://ringingroom.com/authenticate">here</a>.
      </p>

    </div>

  </div>

</div>



